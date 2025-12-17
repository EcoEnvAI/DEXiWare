const db = require('../../config/database');

function getUsers(req, res) {
  return db.users.findAll(
    {
      order: ['id']
    }
  ).then((users) => {
    return res.status(200).json(users);
  });
}

module.exports = getUsers;