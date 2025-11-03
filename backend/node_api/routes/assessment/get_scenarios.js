const db = require('../../config/database');

function getScenarios(req, res) {
  return db.assessment_scenarios.findAll(
    {
      where: {
        assessmentId: req.params.aId
      },
      order: ['id']
    }
  ).then((scenarios) => {
    return res.status(200).json(scenarios);
  });
}

module.exports = getScenarios;