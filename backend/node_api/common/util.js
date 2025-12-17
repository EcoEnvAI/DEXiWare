const bcrypt = require('bcryptjs');

// function to generate hash for passwords
var generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

const createResetLink = (email, currentPass, siteUrl) => {
  let requestHash = calculateHash(email, currentPass);

  return siteUrl + 'reset/' + email  + '/' + requestHash;
}

const createConfirmationLink = (email, confirmationEmailDate, siteUrl) => {
  let requestHash = calculateHash(email, confirmationEmailDate.toString());

  return siteUrl + 'confirm/' + email  + '/' + requestHash;
}

const calculateHash = (email, password) => {
  var salt = "";
  var hash = "";
  
  // some salts never return a valid result
  for (; hash == "" || hash.includes("/"); ) {
    salt = bcrypt.genSaltSync(10);

    // loop until we get a hash that doesn't include the route delimiter char
    for (let hashCnt = 0; hashCnt < 10 && (hash == "" || hash.includes("/")); hashCnt++) {
      hash = bcrypt.hashSync(email + ";" + password, salt)
    }
  }
  
  return hash;
}

module.exports = { generateHash, createResetLink, createConfirmationLink }