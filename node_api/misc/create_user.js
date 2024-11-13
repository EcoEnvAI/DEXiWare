var db = require('../config/database');
const bCrypt = require('bcryptjs');

const username = 'roms';
const password = 'hci2020';
const User = db.users; // they need to be lowercase
const User_roles = db.user_roles;

// function to generate hash for passwords
var generateHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

//function to create new user
console.log("Starting user and role creation...");
var hashedPassword = generateHash(password);

User_roles.create({
  role_name: "Admin"
}, function(err, user){
  if (err){
    console.error('error creating role', err.message);
  }else{
    console.log('role created successfully the database is set up correctly');
  }
}).then(function(gotten_role){
  User.create({
    username: username,
    password: hashedPassword,
    firstname: "Admin",
    lastname: "Admin",
    email: "example@ijs.si",
    phone: "123456",
    company: "IJS",
    companyRole: "developer",
    createdAt: new Date(),
    lastLogin: new Date(),
    role: gotten_role.id
  }, function(err, user){
    if (err){
      console.error('error creating user', err.message);
    }else{
      console.log('user and role created successfully the database is set up correctly');
      console.log("created user and role: "+user);
    }
  });
});

