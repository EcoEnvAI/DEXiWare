const db = require('../../config/database');
const config = require('../../config/runtime')

function buildSubthemes(theme, themes) {
  if (theme.themeId != null) {
    // fill in structure from themes
    theme.dataValues.parentTheme = themes.find(t=>t.id==theme.themeId);
    buildSubthemes(theme.dataValues.parentTheme, themes);
  }
}

function getPillarIndicators(req, res) {
  var uId;
  var role;
  if (req.user) {
    uId = req.user.id;
    role = req.user.role;
    
    if (config.pillar_models || !config.pillar_models) {
      role = 1;
    }
  } else {
    if (config.anonymous) {
      uId = 1;
      role = 1;
    }
  }
  let aId = req.params.aId;

  let rolePromise = Promise.resolve(role);

  if (role != 1) {
    rolePromise = db.assessments.findOne({
      where: {
        id: aId
      }
    }).then(a => {
      if (a.userId == uId) {
        role = 1;
      }
      return role;
    });
  }

  return rolePromise.then((role) => {
    return db.themes.findAll({
      include: [{ model: db.theme_descriptions }]
    }).then(themes => {
      var results;
      if (role == 1) {
        results = db.indicators.findAll({
          where: {
            pillarId: req.params.pId
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
            },
            {
              model: db.assessment_indicator_answers,
              where: {
                valid: true,
                assessmentId: aId
              },
              required: false
            }
          ],
          order: ['id']
        }).then(indicators => indicators.map(indicator => {
            indicator.permissions = ["R", "W"];
            return indicator;
          }));
      } else {
        results = db.user_assessment_indicator.findAll(
          {
            where: {
              userId: uId,
              assessmentId: aId
            },
            include: [
              {
                model: db.user_indicator_privileges
              },
              {
                model: db.indicators,
                where: {
                  pillarId: req.params.pId
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
                  },
                  {
                    model: db.assessment_indicator_answers,
                    where: {
                      valid: true,
                      assessmentId: aId
                    },
                    required: false
                  }
                ]
              }
            ],
            order: [[{model: db.indicators}, 'id', 'asc']]
          }
        ).reduce((indicators, uai) => {
          // transform array of User_assessment_indicators to array of Indicators with permissions collection
          var indicator = null;
          
          if (indicators.length > 0) {
            indicator = indicators[indicators.length-1];
          }
    
          if (indicator == null || indicator.id != uai.Indicator.id) {
            indicator = uai.Indicator;
            indicator.permissions = [];
            indicators.push(indicator);
          }
    
          indicator.permissions.push(uai.User_indicator_privilege.role);
    
          return indicators;
        }, []);
      }
      return results.then((indicators) => {
        for (let indicator of indicators) {
          if (indicator.Theme && indicator.Theme.parentTheme) {
            buildSubthemes(indicator.Theme.parentTheme, themes);
          }
        }
        return res.status(200).json(indicators);
      });
    });
  });
}

module.exports = getPillarIndicators