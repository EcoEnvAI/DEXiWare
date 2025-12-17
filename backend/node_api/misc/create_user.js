var db = require('../config/database');
var util = require('../common/util');

const User = db.users; // they need to be lowercase
const User_roles = db.user_roles;

function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function ensureAdminUser() {
  console.log("Starting user and role creation...");

  const username = requireEnv('ADMIN_USERNAME');
  const password = requireEnv('ADMIN_PASSWORD');
  const email = requireEnv('ADMIN_EMAIL');
  const firstname = process.env.ADMIN_FIRSTNAME || 'Admin';
  const lastname = process.env.ADMIN_LASTNAME || 'Admin';

  let adminRole = await User_roles.findByPk(1);
  if (!adminRole) {
    adminRole = await User_roles.create({
      id: 1,
      role_name: 'Admin'
    });
    console.log('Admin role created.');
  }

  const hashedPassword = util.generateHash(password);

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const updates = {};
    if (existingUser.role !== adminRole.id) updates.role = adminRole.id;
    if (existingUser.username !== username) updates.username = username;
    if (existingUser.firstname !== firstname) updates.firstname = firstname;
    if (existingUser.lastname !== lastname) updates.lastname = lastname;
    if (existingUser.confirmed !== true) updates.confirmed = true;
    if (Object.keys(updates).length > 0) {
      await existingUser.update(updates);
      console.log('Admin user updated.');
    } else {
      console.log('Admin user already exists, skipping.');
    }
    return;
  }

  await User.create({
    username: username,
    password: hashedPassword,
    firstname: firstname,
    lastname: lastname,
    email: email,
    phone: process.env.ADMIN_PHONE || "123456",
    company: process.env.ADMIN_COMPANY || "ACME",
    companyRole: process.env.ADMIN_COMPANY_ROLE || "developer",
    createdAt: new Date(),
    lastLogin: new Date(),
    role: adminRole.id,
    confirmed: true
  });

  console.log('Admin user created.');
}

module.exports = { ensureAdminUser };

if (require.main === module) {
  ensureAdminUser()
    .then(() => db.sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      return db.sequelize.close()
        .catch(() => undefined)
        .finally(() => process.exit(1));
    });
}

