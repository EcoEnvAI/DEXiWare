const db = require('../../config/database');
var util = require('../../common/util');

function createUser(req, res) {
    let firstname = '';
    let lastname = '';

    let name = req.body.name;
    let parts = name.split(' ');
    if (parts.length > 1) {
        firstname = parts.shift();
        lastname = parts.join(' ');
    } else {
        firstname = name;
    }

    let email = req.body.email;
    
    let randomPassword = (+new Date * Math.random()).toString(36).substring(0, 8);

    return db.users.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: name,
        password: util.generateHash(randomPassword),
        assessmentId: req.params.aId,
        createdAt: new Date()
    }).then((user) => {
        return db.assessment_users.create({assessmentId: req.params.aId, userId: user.id}).then(() => { 
            return res.status(201).json(user);
        });
    }).catch((err) => {
        if (err && err.errors && err.errors.length > 0) {
            return res.status(403).json({
                message: err.errors[0].message
            });
        } else {
            console.log(err);
            return res.status(500).send();
        }
    });
}

function addUser(req, res) {
    let uId = req.params.uId;
    return db.assessment_users.create({assessmentId: req.params.aId, userId: uId}).then(() => { 
        return res.status(201).send();
    });
}

module.exports = { createUser, addUser };