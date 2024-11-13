const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport')

// set custom auth
const auth = () => {
  return (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
      if(error) {
        res.status(300).json({"statusCode": 300, "message": error});
        return next(error)
      }
      req.login(user, function(error) {
        if (error) {
          return next(error);
        }
        next();
      });
    })(req, res, next);
  }
}

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next()
  }
  return res.status(400).json({"statusCode" : 400, "message" : "not authenticated"})
}

router.post('/api/authenticate', auth(), (req,res) => {
  res.status(200).json({"statusCode": 200, "message": "hello"});
})

module.exports = router;
