const LocalStrategy = require('passport-local').Strategy;
const db = require('./database');
const bcrypt = require('bcryptjs');

// Load Users model
const User = db.users;

module.exports = function(passport) {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: {id: id}
    }).then((user) => {
      done(null,user);
    }).catch((err) => {
      done(err);
    })
  });
  // login & authenticate
  passport.use(
    'local',
    new LocalStrategy({usernameField: 'username'}, (username, password, done) => {
      // Match User
      User.findOne({
        where: {
          username: username
        }
      }).then(user => {
        if(!user) {
          console.log("Username incorrect!")
          return done("unauthorized access", false)
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;

          if(isMatch) {
            // Update last login
            user.update({
              lastLogin: getTimePlusHours(1)
            });
            const userInfo = user.get();
            //console.log(userInfo);
            return done(null, userInfo);
          } else {
            return done("unauthorized access", false);
          }
        });
      }).catch(err => console.log(err));
    })
  );
}



// Returns the time with added plusHours to current time
function getTimePlusHours(plusHours) {
  var cTime = new Date();
  return cTime.setHours(cTime.getHours() + plusHours)
}
