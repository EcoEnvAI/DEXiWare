const db = require('../../config/database');

function createAssessment(req, res) {
    return db.assessments.create({
        name: req.body.name,
        language: "English",
        createdAt: Date(),
        assessment_typeId: 1,
        userId: req.user.id
      }).then((item) => {
          return db.assessment_users.create({
              assessmentId: item.id,
              userId: req.user.id
          }).then(() => {
            return res.status(201).json(item);
          })
      });
}

module.exports = createAssessment