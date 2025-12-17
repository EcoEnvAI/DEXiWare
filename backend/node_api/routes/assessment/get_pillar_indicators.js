const db = require('../../config/database');

function getPillarIndicators(req, res) {
  return db.indicators.findAll(
    {
      where: {
        pillarId: req.params.pId
      },
      include: [
        {
          model: db.indicator_descriptions
        },
        {
          model: db.user_assessment_indicator,
          many: true,
          include: [{
            model: db.user_indicator_privileges
          }],
          where: {
            assessmentId: req.params.aId,
          },
          required: false
        },
        {
          model: db.assessment_indicator_answers,
          where: {
            assessmentId: req.params.aId,
            valid: true
          },
          required: false
        }
      ],
      order: ['id']
    }
  ).then((indicators) => {
    return res.status(200).json(indicators);
  });
}

module.exports = getPillarIndicators