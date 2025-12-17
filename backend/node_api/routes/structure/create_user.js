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
    }

    let email = req.body.email;

    return db.users.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: name,
        password: util.generateHash('test'),
        createdAt: new Date(),
        confirmed: true
    }).then((user) => {
        return res.status(201).json(user);
    });
}

module.exports = createUser;