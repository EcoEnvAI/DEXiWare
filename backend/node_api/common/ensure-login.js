const ensureLogin =  require('connect-ensure-login');
var config = require('../config/config.json');

module.exports = {}

module.exports.ensureLoggedIn = function (options) {
    if (config.anonymous) {
        return function(req, res, next) {
            next();
          }
    } else {
        return ensureLogin.ensureLoggedIn(options);
    }
}