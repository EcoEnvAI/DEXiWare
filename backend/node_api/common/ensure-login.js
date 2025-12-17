const ensureLogin =  require('connect-ensure-login');
var config = require('../config/runtime');

module.exports = {}

module.exports.ensureLoggedIn = function (options) {
    if (config.anonymous) {
        return function(req, res, next) {
            next();
          }
    } else {
        const fallback = ensureLogin.ensureLoggedIn(options);
        return function(req, res, next) {
            if (req.isAuthenticated && req.isAuthenticated()) {
                return next();
            }

            const acceptsJson = req.accepts && req.accepts(['json', 'html']) === 'json';
            const isApi = req.originalUrl && (req.originalUrl.startsWith('/api') || req.originalUrl.includes('/api/'));
            if (acceptsJson || isApi || req.xhr) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            return fallback(req, res, next);
        }
    }
}