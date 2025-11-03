const db = require('../../config/database');

function deleteAssessment(req, res) {
  return db.assessments.findOne(
    {
      where: {
        id: req.params.aId
      }, include: [
        { model: db.assessment_scenarios },
        { model: db.assessment_indicator_answers }
      ]
    }
  ).then((assessment) => {
    if (assessment) {
      let promises = [];
      
      // delete scenarios
      for (let scenario of assessment.Assessment_scenarios) {
        promises.push(scenario.destroy());
      }

      // delete assessment_answers
      for (let answer of assessment.Assessment_indicator_answers) {
        promises.push(answer.destroy());
      }

      // empty users
      promises.push(db.users.update({assessmentId: null}, {where: {assessmentId: assessment.id}}));

      return Promise.all(promises).then(() => {
        return assessment.destroy().then(() => {
          return res.status(200).send();
        });
      });
    } else {
      return res.status(404).send();
    }
  }).catch((err) => {
    console.log(err);
    return res.status(500).send();
  });
}

module.exports = deleteAssessment;