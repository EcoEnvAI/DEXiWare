const db = require('../../config/database');

function getPillarIndicators(req, res) {
  return db.indicators.findAll(
    {
      where: {
        pillarId: req.params.pId
      },
      order: ['id'],
      include: [
        {
          model: db.indicator_descriptions
        },
        {
          model: db.themes,
          include: [{
            model: db.theme_descriptions
          },
          {
            model: db.themes,
            as: 'parentTheme',
            include: [{
              model: db.theme_descriptions
            }]
          }]
        },
        {
          model: db.indicator_thresholds,
          separate: true,
          include: [{
            model: db.indicator_threshold_descriptions
          }],
          order: ['value']
        }
      ]
    }
  ).then((indicators) => {
    return res.status(200).json(indicators);
  });
}

function getNodeIndicators(req, res) {
  return db.indicators.findAll(
    {
      where: {
        pillarId: req.params.pId,
        nodeId: req.params.nId,
        id: 1
      },
      include: [
        {
          model: db.indicator_descriptions
        },
        {
          model: db.themes,
          include: [{
            model: db.theme_descriptions
          },
          {
            model: db.themes,
            as: 'parentTheme',
            include: [{
              model: db.theme_descriptions
            }]
          }]
        },
        {
          model: db.indicator_thresholds,
          separate: true,
          include: [{
            model: db.indicator_threshold_descriptions
          }],
          order: ['value']
        }
      ]
    }
  ).then((indicators) => {
    return res.status(200).json(indicators);
  });
}

module.exports = { getNodeIndicators, getPillarIndicators }