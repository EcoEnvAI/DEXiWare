const db = require('../../config/database');
const defaultAssessment = require('../../config/defaultAssessment.json');

async function createDefaultAssessment(req, res) {
  let name = await db.assessments.findAll({
    where: { userId: req.user.id },
    attributes: ['name']
  }).then(existingAssessments => {
    const existingNames = existingAssessments.map(a => a.name);
    let baseName = "Demo assessment";
    let name = baseName;
    let counter = 1;
    while (existingNames.includes(name)) {
      name = baseName + " " + counter;
      counter++;
    }

    return name;
  });

  return db.assessments.create({
      name: name,
      language: "English",
      createdAt: Date(),
      assessment_typeId: 1,
      userId: req.user.id
    }).then(async (item) => {
      for (let indicator of defaultAssessment.indicators) {
        let answer = indicator.Assessment_indicator_answers[0];
        if (answer){
          await db.assessment_indicator_answers.create({
            indicatorId: answer.indicatorId,
            value: answer.value,
            userId: req.user.id,
            assessmentId: item.id,
            timestamp: answer.timestamp,
            valid: answer.valid
          });
        }
      }
      return db.assessment_users.create({
          assessmentId: item.id,
          userId: req.user.id
      }).then(() => {
        return res.status(201).json(item);
      })
    });
}

module.exports = createDefaultAssessment