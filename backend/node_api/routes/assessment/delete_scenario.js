const db = require('../../config/database');

function getScenarios(req, res) {
  return db.assessment_scenarios.findOne(
    {
      where: {
        assessmentId: req.params.aId,
        id: req.params.sId
      }
    }
  ).then((scenario) => {
    if (scenario) {
      return scenario.destroy().then(() => {
        return res.status(200).send();
      });
    } else {
      return res.status(404).send();
    }
  }).catch((err) => {
    console.log(err);
    return res.status(500).send();
  });
}

module.exports = getScenarios;