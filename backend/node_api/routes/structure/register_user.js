const nodemailer = require('nodemailer');
const db = require('../../config/database');
const config = require('../../config/runtime');
var util = require('../../common/util');

const sendConfirmationLink = (email, confirmationEmailDate, siteUrl) => {
    return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport(config.getSmtpTransportConfig());

      let confirmationLink = util.createConfirmationLink(email, confirmationEmailDate, siteUrl);

      var mailOptions = {
        from: config.emailFrom,
        to: email,
        subject: 'Email confirmation',
        text: 'To confirm your email please visit ' + confirmationLink + ' .\r\n\r\nThis is an automated e-mail. Please do not reply to it.',
        html: 'To confirm your email please <a href="' + confirmationLink + '">click here</a> .<br/><br/> This is an automated e-mail. Please do not reply to it.',
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
  
const getSiteUrl = (req) => {
    let site = req.protocol + "://" + req.hostname;

    return site;
}

var registerUser = function (req, res) {
    let firstname = '';
    let lastname = '';

    let siteUrl = getSiteUrl(req) + req.body.site;
    let name = req.body.name;
    let parts = name.split(' ');
    if (parts.length > 1) {
        firstname = parts.shift();
        lastname = parts.join(' ');
    }

    let email = req.body.email;

    let password = util.generateHash('test');

    if (req.body.password) {
        password = util.generateHash(req.body.password);
    }

    return db.users.findOne({where: { email: email}}).then((existing) => {
      if (existing) {
        return res.status(403).send();
      } else {
        confirmationEmailDate = new Date();
        return db.users.create({
          firstname: firstname,
          lastname: lastname,
          email: email,
          username: name,
          password: password,
          createdAt: Date(),
          confirmationEmailDate: confirmationEmailDate,
          role: 2
        }).then((user) => {
          return db.assessments.create({
            name: "Assessment " + email,
            language: "English",
            createdAt: Date(),
            assessment_typeId: 1,
            userId: user.id
          }).then((a) => {
            return db.assessment_users.create({assessmentId: a.id, userId: user.id}).then(() => {              
              return sendConfirmationLink(email, confirmationEmailDate, siteUrl).then((ret) => {
                return res.status(201).json(user);
              });

            });
          });
        });
      }
    });
}

module.exports = {registerUser, sendConfirmationLink};