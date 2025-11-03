const db = require('../../config/database');

function getUsers(req, res) {
  return db.assessments.findOne({
    where: {
      id: req.params.aId
    },
    include: [
      { model: db.users, through: db.assessment_users, as: 'users', order: ['id'] }
    ]
  }).then((assessment) => {
    return res.status(200).json(assessment.users);
  }).catch(err => {
    console.log(err);
    return res.status(500).send();
  });
}

module.exports = getUsers;