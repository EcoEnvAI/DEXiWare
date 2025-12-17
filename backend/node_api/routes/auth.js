const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
const nodemailer = require('nodemailer');
const url  = require('url');
const db = require('../config/database');
const config = require('../config/runtime');
const util = require('../common/util');
const { sendConfirmationLink } = require('./structure/register_user');

// set custom auth
const auth = (req, res, next) => {
    passport.authenticate('local', (ignore, user, error) => {
      if (error) {
          if (user) {
            if (error == "unconfirmed user") {
              res.status(403).send(error);
            } else {
              res.status(401).send(error);
            }
          } else {
            res.status(404).send(error);
          }
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

const getSiteUrl = (req) => {
  let site = req.protocol + "://" + req.hostname;

  return site;
}

const getResetLink = (req, res) => {
  let email = req.body.email;
  let site = getSiteUrl(req) + req.body.site;

  if (email) {
    // find user
    return db.users.findOne(
      { where:
        { email: email }
      }).then(user => {
        if (user) {
          let link =  util.createResetLink(email, user.password, site);
          res.status(200).json({
            "link": link
          });
        } else {
        // user with specified email not found
        res.status(404).send();
      }
    }).catch(err => {
      console.log(err);
      res.status(500).send();
    });
  } else {
    res.status(400).send("Specify email");
  }
}

const reset = (req, res) => {
  let email = req.body.email;

  if (email) {
    let site = getSiteUrl(req) + req.body.site;

    // find user
    return db.users.findOne(
      { where:
        { email: email }
      }).then(user => {
        if (user) {
          sendResetLink(email, user.password, site).then(() => {
            // link sent successfully
            res.status(200).send();
          }).catch(err => {
            console.log(err);
            res.status(500).send();    
          });
        } else {
          // user with specified email not found
          res.status(404).send();
        }
      }).catch(err => {
        console.log(err);
        res.status(500).send();
      });
    } else {
      res.status(400).send("Specify email");
    }
}

const sendResetLink = (email, currentPass, siteUrl) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport(config.getSmtpTransportConfig());

    let resetLink = util.createResetLink(email, currentPass, siteUrl);

    var mailOptions = {
      from: config.emailFrom,
      to: email,
      subject: 'Password reset',
      text: 'To reset your password please visit ' + resetLink + ' .\r\n\r\nThis is an automated e-mail. Please do not reply to it.',
      html: 'To reset your password please <a href="' + resetLink + '">click here</a> .<br/><br/> This is an automated e-mail. Please do not reply to it.',
    };
      
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    });
  });
}

const isValidEmailHash = (req, res) => {
  let email = req.params.email;
  let hash = req.params.hash;

  return db.users.findOne(
    { where:
      { email: email }
    }).then(async (user) => {
      let currentPass = user.password;
      let result = await compareHashes(email + ";" + currentPass, hash);
      let payload = { name: user.firstname + ' ' + user.lastname, success: result, site: getSiteUrl(req) };
      res.status(200).json(payload);
    });
}

const setPassword = (req, res) => {
  let email = req.params.email;
  let hash = req.params.hash;
  let password = req.body.password;

  return db.users.findOne(
    { where:
      { email: email }
    }).then(user => {
      let currentPass = user.password;

      compareHashes(email + ";" + currentPass, hash).then((match) => {
        if (match) {
          return user.update(
            {
              password: util.generateHash(password)
            }).then(() => {
              res.status(200).json({
                success: true
              });
            });
        } else {
          return res.status(401).send();
        }
      });
    });
}

const compareHashes = (input, hash2) => {
  return bcrypt.compare(input, hash2);
}

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next()
  }
  return res.status(400).json({"statusCode" : 400, "message" : "not authenticated"})
}

const confirmEmail = function (req, res) {
  let email = req.params.email;
  let hash = req.params.hash;

  return db.users.findOne(
    { where:
      { email: email }
    }).then(async (user) => {
      let confirmationEmailDate = user.confirmationEmailDate;
      let result = await compareHashes(email + ";" + confirmationEmailDate.toString(), hash);
      if (result) {
        return user.update({
          confirmed: true
        }).then(() => {
          return res.status(200).json({success: true});
        });
      } else {
        return res.status(401).json({success: false});
      }
    });
}

const resendEmailConfirmation = function (req, res) {
  let email = req.body.email;
  let siteUrl = getSiteUrl(req) + req.body.site;

  return db.users.findOne(
    { where:
      { email: email }
    }).then(async (user) => {
        let confirmationEmailDate = new Date();
        user.update({
          confirmationEmailDate: confirmationEmailDate
        }).then(() => {
          return sendConfirmationLink(email, confirmationEmailDate, siteUrl).then((ret) => {
            return res.status(201).json(user);
          });
        });
      }
    );
  }


/**
 * @openapi
 * /api/authenticate:
 *   post:
 *     summary: Authenticate user with local strategy
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Authenticated user returned
 *       401:
 *         description: Unauthorized
 */
router.post('/api/authenticate', auth, (req, res) => {
  res.status(200).json(req.user);
});
/**
 * @openapi
 * /api/reset/link:
 *   post:
 *     summary: Get password reset link for a user email
 *     tags:
 *       - Auth
 */
router.post('/api/reset/link', getResetLink);
/**
 * @openapi
 * /api/reset:
 *   post:
 *     summary: Send password reset email
 *     tags:
 *       - Auth
 */
router.post('/api/reset', reset);
/**
 * @openapi
 * /api/reset/{email}/{hash}:
 *   get:
 *     summary: Verify reset link
 *     tags:
 *       - Auth
 */
router.get('/api/reset/:email/:hash', isValidEmailHash);
/**
 * @openapi
 * /api/reset/{email}/{hash}:
 *   post:
 *     summary: Set new password using reset link
 *     tags:
 *       - Auth
 */
router.post('/api/reset/:email/:hash', setPassword);

/**
 * @openapi
 * /api/resend/link:
 *   post:
 *     summary: Resend email confirmation link
 *     tags:
 *       - Auth
 */
router.post('/api/resend/link', resendEmailConfirmation)
/**
 * @openapi
 * /api/confirm/{email}/{hash}:
 *   get:
 *     summary: Confirm user email
 *     tags:
 *       - Auth
 */
router.get('/api/confirm/:email/:hash', confirmEmail);

module.exports = router;
