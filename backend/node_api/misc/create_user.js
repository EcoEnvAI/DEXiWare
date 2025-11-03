var db = require('../config/database');
var util = require('../common/util');

const username = 'admin';
const password = 'admin';
const User = db.users; // they need to be lowercase
const User_roles = db.user_roles;

//function to create new user
console.log("Starting user and role creation...");
var hashedPassword = util.generateHash(password);

return User_roles.create({
  role_name: "Admin"
}, function(err, user){
  if (err){
    console.error('error creating role', err.message);
  }else{
    console.log('role created successfully the database is set up correctly');
  }
}).then(function(gotten_role){
  return User.create({
    username: username,
    password: hashedPassword,
    firstname: "Admin",
    lastname: "Admin",
    email: "example@example.com",
    phone: "123456",
    company: "ACME",
    companyRole: "developer",
    createdAt: new Date(),
    lastLogin: new Date(),
    role: gotten_role.id,
    confirmed: true
  }, function(err, user){
    if (err){
      console.error('Error creating user', err.message);
    }else{
      console.log('User and role created successfully. The database is set up correctly');
      console.log("Created user and role: " + user);
    }
  });
});

