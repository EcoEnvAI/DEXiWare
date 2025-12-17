const db = require('../../config/database');
const config = require('../../config/runtime')

function getUserPillars(req, res) {
  var uId;
  if (req.user) {
    uId = req.user.id;
  } else {
    if (config.anonymous) {
      uId = 1;
    }
  }
  let aId = req.params.aId;

  return db.pillars.findAll(  
    {
      attributes: { 
        include: ['id',
          [db.Sequelize.fn("COUNT", db.Sequelize.col("Indicators.id")), "indicatorCount"],
          [db.Sequelize.fn("COUNT", db.Sequelize.col("Indicators->Assessment_indicator_answers.id")), "answerCount"]
        ] 
      },
      include: [
        {
          model: db.pillar_descriptions
        },
        {
          model: db.nodes,
          required: false,
          include: [{
            model: db.node_descriptions,
            required: false
          }]
        },
        {
          model: db.indicators,
          attributes: [],
          include: [
            {
              model: db.assessment_indicator_answers,
              attributes: [],
              where: {
                valid: true,
                assessmentId: aId
              },
              required: false
            }
          ]
        }
      ],
      group: ['Pillars.id', 'Pillar_descriptions.id', 'Nodes.id', 'Nodes->Node_descriptions.id'],
      order: ['id']
    }
  ).then((pillars) => {
    return res.status(200).json(pillars);
  });
}

module.exports = getUserPillars