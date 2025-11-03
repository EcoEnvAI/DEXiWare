var crypto = require("crypto");
var db = require('../config/database');
var util = require('../common/util');

if (process.argv.length != 7) {
    console.log("Usage: node create_assessment_user.js <assessment_id> <username> <firstname> <lastname> <email>");
} else {
    let assessment_id = process.argv[2];
    let username = process.argv[3];
    let firstname = process.argv[4];
    let lastname = process.argv[5];
    let email = process.argv[6];

    let password = crypto.randomBytes(20).toString('hex');
    let hashedPassword = util.generateHash(password);

    return db.assessments.findOne({
        where: {
            id: assessment_id
        }
    }).then((assessment) => {
        if (assessment) {
            return db.user_roles.findOne({
                where: {id: 1}
            }).then((role) => {
                return db.users.create({
                    username: username,
                    password: hashedPassword,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    role: role.id,
                    assessmentId: assessment_id,
                    confirmed: true
                }).then(() => {
                    let siteUrl = "http://site.url/"; 
                    let resetLink = util.createResetLink(email, hashedPassword, siteUrl);
                    console.log("Password reset link is: " + resetLink);
                    return true;
                });
            });
        } else {
            console.log("No assessment with id " + assessment_id + " in database.");
            return false;
        }
    });
}