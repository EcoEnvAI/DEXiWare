const db = require('../../config/database');

function getAssessments(req, res) {
  if (req.user.role == 1) {
    // Administrator
    return db.assessments.findAll().then((assessments) => {
      return res.status(200).json(assessments);
    });
  } else {

    db.users.findOne({
      where: {
        id: req.user.id
      },
      include: [
        { model: db.assessments, through: db.assessment_users, as: 'assessments' }
      ]
    }).then((user) => {
      return res.status(200).json(user.assessments);
    }).catch(err => {
      console.log(err);
      return res.status(500).send();
    });
  }
}

module.exports = getAssessments