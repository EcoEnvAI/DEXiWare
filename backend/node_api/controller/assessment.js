const _ = require('lodash');
const libHandler = require('../business_logic/handler/library');
const outputHandler = require('../business_logic/handler/output');
const db = require('../config/database');
const taskConfig = require('../config/tasks');
const config = require('../config/runtime');
const modelPathManager = require(taskConfig.getModel('manage_attribute_path').set[0].path);

const analysis = require('./analysis');
const { themes } = require('../models/all_models');

// Functions that run assessment through corresponding DEX library
evaluate = function (req, res) { doEvaluate(false, req).then(ret => res.status(ret.status).send(ret.data)); }
evaluateRoot = function (req, res) { doEvaluate(true, req).then(ret => res.status(ret.status).send(ret.data)); }

evaluateAssessmentBottomUp = function (req, res) {
  let body = req.body;

  return db.themes.findAll(
    { include: [
      { model: db.theme_descriptions }
    ]}
  ).then((themes) => {
    let themesFlat = {};
    for (let theme of themes) {
        if (theme.themeId) {
            themesFlat[theme.id] = { parentId: theme.themeId, name: theme.Theme_descriptions[0].name };
        } else {
            themesFlat[theme.id] = { parentId: null, name: theme.Theme_descriptions[0].name };
        }
    }

    return themesFlat;
  }).then(themesFlat => {
    return db.indicators.findAll({
      include: [
        { model: db.indicator_descriptions}
      ]
    }).then(allIndicators => {
      return Promise.all([
        db.pillars.findAll({
          include: [{
            model: db.pillar_descriptions
          }],
          order: ['id']
        }),
        db.nodes.findAll({
          include: [{
            model: db.node_descriptions
          }]
        })]).then(([pillars, nodes]) => {
          let changes = [];

          for (let pillar in body) {
            if (body[pillar].value != null) {
              var pillarObj;
              if (config.pillar_models && "model" in req.body) {
                let parts = req.body.model.toUpperCase().split("_");
                let model = parts[0];
                pillarObj = pillars.find(p => p.Pillar_descriptions[0].name.toUpperCase() == pillar.toUpperCase() + "_" + model);
              } else {
                pillarObj = pillars.find(p => p.Pillar_descriptions[0].name.toUpperCase() == pillar.toUpperCase());
              }

              let pillar_model = pillarObj.model;
              let pillar_description = pillarObj.Pillar_descriptions[0].description;

              changes.push({
                "value": body[pillar].value + 1,
                "indicator_path": "",
                "indicator_name": pillar_model,
                "value_description": ""
              });
            }

            for (let node in body[pillar].nodes) {
              var pillarObj;
              if (config.pillar_models && "model" in req.body) {
                let parts = req.body.model.toUpperCase().split("_");
                let model = parts[0];
                pillarObj = pillars.find(p => p.Pillar_descriptions[0].name.toUpperCase() == pillar.toUpperCase() + "_" + model);
              } else {
                pillarObj = pillars.find(p => p.Pillar_descriptions[0].name.toUpperCase() == pillar.toUpperCase());
              }
              let pillar_model = pillarObj.model;
              let pillar_description = pillarObj.Pillar_descriptions[0].description;

              let node_name = nodes.find(n => n.Node_descriptions[0].name.toUpperCase() == node.toUpperCase()).name;
              if (body[pillar].nodes[node].value != null) {
                var indicator_name;
                if (config.pillar_models && "model" in req.body) {
                  indicator_name = node_name;
                } else {
                  indicator_name = node_name + "_" + pillar_model;
                }

                changes.push({
                  "value": body[pillar].nodes[node].value + 1,
                  "indicator_path": [pillar_description],
                  "indicator_name": indicator_name,
                  "value_description": ""
                });
              }
              for (let indicatorId in body[pillar].nodes[node].indicators) {
                let singleIndicator = allIndicators.find(i => i.id == indicatorId);
                let indicator = singleIndicator.Indicator_descriptions[0].name;

                if (body[pillar].nodes[node].indicators[indicatorId] != null) {

                  let path = [pillar_description, node_name];
          
                  if (singleIndicator.themeId) {
                    path = path.concat(themeList(themesFlat, singleIndicator.themeId));
                  }
                  changes.push({
                    "value": body[pillar].nodes[node].indicators[indicatorId],
                    "indicator_path": path,
                    "indicator_name": indicator,
                    "value_description": ""
                  });
                }
              }
            }
          }

          let reqBody = {"assessment_changes": changes};

          var promise;
          var params = {};
          if (config.pillar_models && "model" in req.body) {
            let model = req.body["model"];
            params["task"] = model;
            promise = buildModelAssessmentValues(req.params.aId, model);
          } else {
            promise = buildAssessmentValues(req.params.aId);
          }

          return promise.then((assessmentBody) => {
            let xReq = { "body": Object.assign(reqBody, assessmentBody), "params": params };

            const fs = require('fs');
            fs.writeFileSync('output.json', JSON.stringify(xReq.body, null, 4));

            return analysis.bottomUpAnalysis(xReq).then((ret) => {
              console.log('Response data:', ret.data.data);

              if (ret.data.data && ret.data.data.alternatives) {
                if (config.pillar_models) {
                  for (let item of ret.data.data) {
                    if (assessmentBody.assessment_answers.filter(a=>a.model_name==item.model_name).length == 0) {
                      // replace all 3 values with empty / null
                      for (let attribute of item.alternatives[0].evaluation) {
                        attribute.values = ["undefined"];
                      }
                    }
                  }
                  res.status(ret.status).send(ret.data);
                } else {
                  let models = ret.data.data.alternatives[0].evaluation.filter(e => e.path.startsWith('/AgriFoodChain') && e.path.endsWith('Pillar') && e.path.split('/').length == 3);
                  for (let model of models) {
                    let parts = model.path.split('/');
                    let pillarName = parts[parts.length - 1];
                    var pillarIdentifier;

                    switch(pillarName) {
                      case 'EconomicPillar':
                        pillarIdentifier = "ECONOMIC PILLAR";
                        break;
                      case 'EnvironmentalPillar':
                        pillarIdentifier = "ENVIRONMENTAL PILLAR";
                        break;
                      case 'Social-PolicyPillar':
                        pillarIdentifier = "SOCIO-POLICY PILLAR";
                        break;
                      default:
                        break;
                    }

                    if (assessmentBody.assessment_answers.filter(a => a.indicator_path[0] == pillarIdentifier).length == 0) {
                      model.values = ["undefined"];
                    }
                  }

                  res.status(ret.status).send(ret.data);
                }
              } else {
                console.error('Invalid response structure:', ret.data.data);
                res.status(500).send({ error: 'Invalid response structure' });
              }
            });
          });
        });
      });
    });
}

evaluateAssessmentTopDown = function (req, res) {
  let reqBody = req.body;
  return buildAssessmentValues(req.params.aId).then((asessmentBody) => {
    let xReq = { "body": Object.assign(reqBody, asessmentBody), "params": {} };
    return analysis.topDownAnalysis(xReq, res);
  });
}

evaluateAssessment = function (req, res) {
  var promise;
  var params = {};

  if (config.pillar_models && "model" in req.body) {
    let model = req.body["model"];
    params["task"] = model;
    promise = buildModelAssessmentValues(req.params.aId, model);
  } else {
    promise = buildAssessmentValues(req.params.aId);
  }
  return promise.then((assessmentBody) => {
    let xReq = { "body": assessmentBody, "params": params };

    const fs = require('fs');
    fs.writeFileSync('output.json', JSON.stringify(xReq.body, null, 4));

    return doEvaluate(false, xReq).then(ret => {
      console.log('Response data:', ret.data.data);

      if (ret.data.data && ret.data.data.alternatives) {
        if (config.pillar_models) {
          for (let item of ret.data.data) {
            if (assessmentBody.assessment_answers.filter(a=>a.model_name==item.model_name).length == 0) {
              // replace all 3 values with empty / null
              for (let attribute of item.alternatives[0].evaluation) {
                attribute.values = ["undefined"];
              }
            }
          }
          res.status(ret.status).send(ret.data);
        } else {
          let models = ret.data.data.alternatives[0].evaluation.filter(e => e.path.startsWith('/AgriFoodChain') && e.path.endsWith('Pillar') && e.path.split('/').length == 3);
          for (let model of models) {
            let parts = model.path.split('/');
            let pillarName = parts[parts.length - 1];
            var pillarIdentifier;

            switch(pillarName) {
              case 'EconomicPillar':
                pillarIdentifier = "ECONOMIC PILLAR";
                break;
              case 'EnvironmentalPillar':
                pillarIdentifier = "ENVIRONMENTAL PILLAR";
                break;
              case 'Social-PolicyPillar':
                pillarIdentifier = "SOCIO-POLICY PILLAR";
                break;
              default:
                break;
            }

            if (assessmentBody.assessment_answers.filter(a => a.indicator_path[0] == pillarIdentifier).length == 0) {
              model.values = ["undefined"];
            }
          }

          res.status(ret.status).send(ret.data);
        }
      } else {
        console.error('Invalid response structure:', ret.data.data);
        res.status(500).send({ error: 'Invalid response structure' });
      }
    });
  });
}

buildModelAssessmentValues = function(aId, modelName) {
  let pillarModels = taskConfig.config.tasks["tomres_" + modelName]["applicable"];

  return db.assessments.findOne(
    {
      where: { id: aId },
      include: [{
        separate: true,
        model: db.assessment_indicator_answers,
        where: {
          valid: true
        },
        include: [{
          model: db.indicators,
          where: {id: {[db.Sequelize.Op.not]: null}},
          include: [
            {
              model: db.indicator_descriptions
            }, {
              model: db.pillars,
              include: [{
                model: db.pillar_descriptions
              }],
              where: {'model': pillarModels}
            }, {
              model: db.nodes,
              include: [{
                model: db.node_descriptions
              }]
            }, {
              separate: true,
              model: db.indicator_thresholds,
              include: [{
                model: db.indicator_threshold_descriptions
              }]
            }
          ]
        }],
        order: [[{model: db.indicators}, 'id', 'asc']]
      }
    ]
    }).then(
    (assessment) => {
      let answers = [];
      for (let answer of assessment.Assessment_indicator_answers) {
        let threshold = answer.Indicator.Indicator_thresholds.find(t=>t.value==answer.value);
        answers.push({
          "value": answer.value,
          "model_name": answer.Indicator.Pillar.model,
          "indicator_path": [answer.Indicator.Pillar.Pillar_descriptions[0].description, answer.Indicator.Node.Node_descriptions[0].name],
          "value_description": threshold.Indicator_threshold_descriptions[0].name,
          "indicator_name": answer.Indicator.Indicator_descriptions[0].name
        });
      }

      return  { "assessment_name": assessment.name, "assessment_answers": answers};
    }
  );
}

themeList = function (themesFlat, themeId) {
  var themes;
  let theme = themesFlat[themeId];
  if (theme) {
  if (theme.parentId) {
    themes = themeList(themesFlat, theme.parentId);
  } else {
    themes = [];
  }
  themes.push(theme.name);
} else {
  console.log("Fak");
}
  return themes;
}

buildAssessmentValues = function(aId) {

  return db.themes.findAll(
    { include: [
      { model: db.theme_descriptions }
    ]}
  ).then((themes) => {
    let themesFlat = {};
    for (let theme of themes) {
        if (theme.themeId) {
            themesFlat[theme.id] = { parentId: theme.themeId, name: theme.Theme_descriptions[0].name };
        } else {
            themesFlat[theme.id] = { parentId: null, name: theme.Theme_descriptions[0].name };
        }
    }

    return themesFlat;
  }).then(themesFlat => {
    return db.assessments.findOne(
      {
        where: { id: aId },
        include: [{
          separate: true,
          model: db.assessment_indicator_answers,
          where: {
            valid: true
          },
          include: [{
            model: db.indicators,
            include: [{
              model: db.indicator_descriptions
            }, {
              model: db.pillars,
              include: [{
                model: db.pillar_descriptions
              }]
            }, {
              model: db.nodes,
              include: [{
                model: db.node_descriptions
              }]
            }, {
              separate: true,
              model: db.indicator_thresholds,
              include: [{
                model: db.indicator_threshold_descriptions
              }]
            }]
          }]
        }]
      }).then(
      (assessment) => {
        let answers = [];
        for (let answer of assessment.Assessment_indicator_answers) {
          let threshold = answer.Indicator.Indicator_thresholds.find(t=>t.value==answer.value);
  
          let path = [answer.Indicator.Pillar.Pillar_descriptions[0].description, answer.Indicator.Node.Node_descriptions[0].name];
  
          if (answer.Indicator.themeId) {
            path = path.concat(themeList(themesFlat, answer.Indicator.themeId));
          }
          answers.push({
            "value": answer.value,
            "indicator_path": path,
            "value_description": threshold.Indicator_threshold_descriptions[0].name,
            "indicator_name": answer.Indicator.Indicator_descriptions[0].name
          });
        }
  
        return  { "assessment_name": assessment.name, "assessment_answers": answers};
      }
    );
  });


  
}

module.exports = { evaluate, evaluateRoot, evaluateAssessment, evaluateAssessmentBottomUp, evaluateAssessmentTopDown }

/*
* Function for evaluating alternatives
* @params:
*  - root_only: [trye/false] whether to return only roots evaluated or all attributes evaluated
*  - req: express (http(s)) request object
*  - res: express (http(s)) response object
* */
async function doEvaluate(root_only,req) {
  try {
    var response = req.body;
    var task;
    if (req.params.task) {
      task = ("tomres_" + req.params.task);
    } else {
      task = "_";
    }

    if (!Array.isArray(response)) response = [ response ];
    var output = { warning: {} };

    // First get structure for the model (i.e. input value scales)
    let taskModel = taskConfig.getModel( task ,req.params.model);
    var processGrammarEntry = libHandler.prepareExecution( taskModel, "get_attributes", "java" ); //get_attributes, get_inputs
    var processOutput = await libHandler.execute(processGrammarEntry);

    if (processOutput.code != 0) {
      return {status: 400, data: outputHandler.formatOutput(undefined, undefined, processOutput.error, processOutput.code) };
    }

    var structures = processOutput.data;
    if (!Array.isArray(structures)) structures = [ structures ];
    //var idxStructure = _.map(structure.attributes,'attribute');

    /*
    * Prepare the alternatives
    * format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
    */

    let partialGrammarEntries = _.map(structures, (structure) => {
      let structure_name = structure.model_name || "singleton"

      let alt_response = _.map(response, function(alternative){
        var alt = {};
        var processedAttributes = _.flatten(_.map( (alternative.assessment_answers || [] ), (answer) => mapAnswerToAttribute(structure, answer) ));

        alt.alternative = alternative.assessment_name || 'new alternative';
        alt.inputs = _.map(_.filter(processedAttributes, { code: 0 }), "object");

        //Fill up the missing inputs with empty/full value array
        var list_attr_apth = _.map(alt.inputs,'path');
        _.forEach(structure.attributes, (str_attr) => {
          if( list_attr_apth.indexOf(str_attr.path) == -1 && str_attr.type === "input") alt.inputs.push( _.pick(str_attr,['path','values']) );
        })

        output.warning[structure_name + "_" + alt.alternative] = _.concat( (output.warning[structure_name + "_" + alt.alternative] || []), _.map(_.filter(processedAttributes, { code: 1 }), "object") );
        return alt;
      })

      //Prepare assessment evaluation
      return libHandler.prepareExecution(taskConfig.getModel( task, structure.model_name || req.params.model), "evaluate", "java", alt_response );
    })

    //Process assessment evaluation
    processGrammarEntry = { type: taskModel.type, entries: _.flatten(_.map(partialGrammarEntries,'entries')) }
    processOutput = await libHandler.execute(processGrammarEntry, undefined, !!root_only ? pickRootOnly : undefined );

    if(processOutput.code != 0){
      return {status: 400, data: outputHandler.formatOutput(undefined, output.warning, processOutput.error, processOutput.code)};
    }

    return {status: 200, data: outputHandler.formatOutput(processOutput.data, output.warning)};
  } catch (e) {
    return {status: 400, data: outputHandler.formatCatchedError(e)};
  }
}
//====================================================================================

// ----- Utility functions -------
function pickRootOnly(data){
  if(!data.alternatives || !_.isArray(data.alternatives)) return data;

  data.alternatives = _.map(data.alternatives, function(alt){
    if(!alt.evaluation ||  !_.isArray(alt.evaluation)) return alt;
    alt.evaluation = _.filter(alt.evaluation, function(evaluation){ return (!!evaluation.root ) } )
    return alt;
  })
  return data;
}

function mapAnswerToAttribute(structure, answer){
  const answerType = !!answer.type ? [ answer.type ] : [ 'aggregate','input', 'link' ];
  var idxAttribute = _.filter(structure.attributes, (attr) => {
    var attrName = !!modelPathManager.getName ? modelPathManager.getName(attr.attribute) : attr.attribute;
    return modelPathManager.compare(answer.indicator_path,attr.path) &&
      attrName == answer.indicator_name &&
      answerType.indexOf(attr.type) > -1 });

  if(idxAttribute.length == 0) {
    // If provided answer is assigned to particular model that does not corresponds to the current one, then ignore it and omit warning
    if(!!structure.model_name && !!answer.model_name && structure.model_name !== answer.model_name) return [];

    return [{
      code: 1,
      object: 'Attribute "' + answer.indicator_name + '" was not able to be validated, nor found in the original model structure.'
    }]
  }

  return _.map(idxAttribute, function(selectedAttr){
    var valAttribute = [], posAttribute = [];

    if(!!answer.value && !!selectedAttr.values && !!selectedAttr.values[answer.value - 1]) {
      valAttribute.push(selectedAttr.values[answer.value - 1]);
      posAttribute.push(answer.value - 1);
    }

    return {
      code: 0,
      object: {
        values: valAttribute,
        positions: posAttribute,
        scale: _.merge([],selectedAttr.values),
        attribute: answer.indicator_name,
        path: selectedAttr.path
      }
    }
  })
}
//====================================================================================
