var exports = module.exports = {}

const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const libHandler = require('../business_logic/handler/library');
const procHandler = require('../business_logic/handler/process');
const outputHandler = require('../business_logic/handler/output');
const taskConfig = require('../config/tasks');
const modelPathManager = require(taskConfig.getModel('manage_attribute_path').set[0].path);

// Function that run assessment through corresponding DEX library
exports.bottomUpAnalysis = doBottomUpAnalysis.bind(this,false);
exports.bottomUpAnalysisRoot = doBottomUpAnalysis.bind(this,true);
exports.topDownAnalysis = doTopDownAnalysis;

/*
* Top-down analysis controller function
* @params:
*  - root_only: [trye/false] whether to return only roots evaluated or all attributes evaluated
*  - req: express (http(s)) request object
*  - res: express (http(s)) response object
* */
async function doBottomUpAnalysis(root_only,req){
  try{
    var response = req.body;
    var output = { warning: {} };

    //First get structure for the model (i.e. input value scales)
    var task;
    if (req.params.task) {
      task = ("tomres_" + req.params.task);
    } else {
      task = "_";
    }

    let taskModel = taskConfig.getModel(task ,req.params.model);
    var changedAttributes = {};

    var processGrammarEntry = libHandler.prepareExecution(taskModel, "get_attributes", "java");
    var processOutput = await libHandler.execute(processGrammarEntry);

    if (processOutput.code != 0){
      return {status: 400, data: outputHandler.formatOutput(undefined, undefined, processOutput.error, processOutput.code)};
    }

    var structures = processOutput.data;
    if (!Array.isArray(structures)) structures = [ structures ];
    //structure.inputs = _.filter(structure.attributes, { type: 'input' });
    //structure.aggregated = _.filter(structure.attributes, { type: 'aggregate' });

    /*
    * Prepare the alternative
    * format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
    */

    let partialGrammarEntries = _.map(structures, (structure) => {
      let structure_name = structure.model_name || "singleton"
      let modelAnswers = _.filter(response.assessment_answers || [], (answr) => { return structure_name === 'singleton' || answr.model_name === structure_name });

      let pAlternative = {};
      pAlternative.alternative = response.assessment_name || 'new alternative';

      var processedAttributes = {};
      //Process initial values
      _.forEach( modelAnswers, function(answer) {
        const mapAttribute =  mapAnswerToAttribute(structure.attributes,answer);

        _.forEach(mapAttribute, function(mapAttr){
          if(mapAttr.code == 0){
            processedAttributes[mapAttr.object.path] = _.merge( {}, mapAttr.object );
          } else {
            output.warning[structure_name + "_" + pAlternative.alternative] = _.concat( (output.warning[structure_name + "_" + pAlternative.alternative] || []), [ mapAttr.object ] );
          }
        })
      })

      //Process changed values
      _.forEach( response.assessment_changes || [] , function(answer) {
        const mapAttribute =  mapAnswerToAttribute(structure.attributes,answer);

        _.forEach(mapAttribute, function(mapAttr){
          if(mapAttr.code == 0){
            processedAttributes[mapAttr.object.path] = _.merge( {}, mapAttr.object );
            changedAttributes[mapAttr.object.path] = processedAttributes[mapAttr.object.path];
          } else {
            output.warning[structure_name + "_" + pAlternative.alternative] = _.concat( (output.warning[structure_name + "_" + pAlternative.alternative] || []), [ mapAttr.object ] );
          }
        })
      })

      pAlternative.inputs = _.values(processedAttributes);

      //Prepare assessment evaluation
      return processGrammarEntry = libHandler.prepareExecution( taskConfig.getModel( task, structure.model_name), "evaluate_transitional", "java", { alternative: pAlternative } );
    })

    // --- response.alternative = {};
    // --- response.alternative.alternative = response.assessment_name || 'new alternative';



    // --- response.alternative.inputs = _.values(processedAttributes);
    // --- response = _.omit(response,["assessment_name","assessment_answers","assessment_changes"]);

    //Process assessment evaluation
    // --- processGrammarEntry = libHandler.prepareExecution(taskModel, "evaluate_transitional", "java", response );
    processGrammarEntry = { type: taskModel.type, entries: _.flatten(_.map(partialGrammarEntries,'entries')) }
    processOutput = await libHandler.execute(processGrammarEntry, undefined, !!root_only ? pickRootOnly : undefined );

    if (processOutput.code != 0) {
      return {status: 400, data: outputHandler.formatOutput(undefined, output.warning, processOutput.error, processOutput.code)};
    }

    processOutput.data.alternatives = _.map(processOutput.data.alternatives, formatChangedAndUnreliableAttributes.bind(this,changedAttributes) );
    return {status: 200, data: outputHandler.formatOutput(processOutput.data, output.warning)};
  } catch (e) {
    return {status: 400, data: outputHandler.formatCatchedError(e)};
  }
}
//====================================================================================


/*
* Top-down analysis controller function
* @params:
*  - req: express (http(s)) request object
*  - res: express (http(s)) response object
* */
async function doTopDownAnalysis(req,res){
  var response = req.body;

  var output = { warning: {} };

  //First get structure for the model (i.e. input value scales)
  var processGrammarEntry = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "get_attributes", "java");
  var processOutput = await libHandler.execute(processGrammarEntry);

  if(processOutput.code != 0){
    res.status(400).send( outputHandler.formatOutput(undefined, undefined, processOutput.error, processOutput.code) );
    return;
  }

  var structure = processOutput.data;
  structure.inputs = _.filter(structure.attributes, { type: 'input' });
  structure.aggregated = _.filter(structure.attributes, { type: 'aggregate' });

  /*
  * Prepare the alternative
  * format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
  */
  response.alternative = {};
  response.alternative.alternative = response.assessment_name || 'new alternative';

  // =====================> Below code is previous version of top-down analysis, without getting back evaluation of other attributes <=====================
  //var processedAttributes = _.flatten(_.map( (response.assessment_answers || [] ), mapAnswerToAttribute.bind(this,structure.inputs) ));
  //response.alternative.inputs = _.map(_.filter(processedAttributes, { code: 0 }), "object");
  //output.warning[response.alternative.alternative] = _.concat( (output.warning[response.alternative.alternative] || []), _.map(_.filter(processedAttributes, { code: 1 }), "object") );
  // ======================================================================================================================================================

  var processedAttributes = {};
  //Process initial values
  _.forEach( response.assessment_answers || [], function(answer) {
    const mapAttribute =  mapAnswerToAttribute(structure.inputs,answer);

    _.forEach(mapAttribute, function(mapAttr){
      if(mapAttr.code == 0){
        processedAttributes[mapAttr.object.path] = _.merge( {}, mapAttr.object );
      } else {
        output.warning[response.alternative.alternative] = _.concat( (output.warning[response.alternative.alternative] || []), [ mapAttr.object ] );
      }
    })
  })
  response.alternative.inputs = _.values(processedAttributes);
  response = _.omit(response,["assessment_name","assessment_answers"]);

  /*
  * Prepare 'locked' provided property (later to be used in library executor to create 'constant_attributes'
  * Format: array | [{ name: '<attribute_name>', path: '<attribute_path>', ...]
  * */
  if(!response.locked) response.locked = [];
  response.locked = _.flatten(_.map(response.locked, mapObjectToAttribute.bind(this,structure.attributes)));

  //Process assessment evaluation
  let model = taskConfig.getModel("_",req.params.model);

  // dirty hack: topdown won't run with attr_path_manager attribute
  for (let item of model.set) {
    delete item.attr_path_manager;
  }
  processGrammarEntry = libHandler.prepareExecution(model, "generate", "java", response );
  processOutput = await libHandler.execute(processGrammarEntry);

  if(processOutput.code != 0){
    res.status(400).send( outputHandler.formatOutput(undefined, output.warning, processOutput.error, processOutput.code) );
    return;
  }

  //Last run bottom-up analysis to fill up all potential changes that could have taken in other branches from the upper sub-tree, starting from the change
  var extendedOptions = [];
  if (processOutput.data.generated.alternatives) {
    for(var i=0;i<processOutput.data.generated.alternatives.length;i++){
      var c_alt = processOutput.data.generated.alternatives[i];
      var maxChangedDepth = 1;

      //Process changed values
      var baseAlternative = _.assign({},processedAttributes);

      _.forEach( c_alt || [] , function(change) {
        var chDepth = (modelPathManager.resolve(change.path) || []).length;
        if(chDepth > maxChangedDepth) maxChangedDepth = chDepth;

        if(change.attribute == processOutput.data.goal) return;

        const changedAttribute =  extendAttributeObject(structure.attributes,change);

        _.forEach(changedAttribute, function(changedAttr){
          if(changedAttr.code == 0){
            baseAlternative[changedAttr.object.path] = _.merge( {}, changedAttr.object );
          } else {
            output.warning[response.alternative.alternative] = _.concat( (output.warning[response.alternative.alternative] || []), [ mapAttr.object ] );
          }
        })
      })

      //Do bottom-up analysis of the current generated alternative
      var alternativeAnalysisInput = { alternative: {} };
      alternativeAnalysisInput.alternative.alternative = "alt_" + Date.now();
      alternativeAnalysisInput.alternative.inputs = _.values(baseAlternative);

      //Process assessment evaluation
      var processGrammarEntrySubAction = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "evaluate_transitional", "java", alternativeAnalysisInput );
      var processOutputSubAction = await libHandler.execute( processGrammarEntrySubAction );

      if(processOutput.code != 0 || (!!processOutputSubAction.data.alternatives && _.isArray(processOutputSubAction.data.alternatives) && processOutputSubAction.data.alternatives.length == 0) ){
        extendedOptions.push(c_alt);
        continue;
      }

      extendedOptions.push(_.filter(processOutputSubAction.data.alternatives[0].evaluation, function(ch){ return (modelPathManager.resolve(ch.path) || []).length <= maxChangedDepth }));
    }
  }
  //Attach the array with extended options/alternatives
  processOutput.data.generated.alternatives = extendedOptions;

  res.status(200).send( outputHandler.formatOutput(processOutput.data, output.warning) );
}
//====================================================================================


// ----- Utility functions -------

function mapAnswerToAttribute(modelAttributes, answer){
  const answerType = !!answer.type ? [ answer.type ] : [ 'aggregate','input' ];
  const idxAttribute = _.filter(modelAttributes, (attr) => {
    return modelPathManager.compare(answer.indicator_path,attr.path) && attr.attribute == answer.indicator_name && answerType.indexOf(attr.type) > -1;
  });

  if(idxAttribute.length == 0) {
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

function mapObjectToAttribute(modelAttributes, attrObject){
  const objectType = !!attrObject.type ? [ attrObject.type ] : [ 'aggregate','input' ];
  const idxAttribute = _.filter(modelAttributes, (attr) => {
    return modelPathManager.compare(attrObject.indicator_path,attr.path) && attr.attribute == (attrObject.indicator_name || attrObject) && objectType.indexOf(attr.type) > -1;
  });

  return _.map(idxAttribute, function(attr){ return { name: attr.attribute, path: attr.path} });
}

function extendAttributeObject(modelAttributes, attrObject){
  const objectType = !!attrObject.type ? [ attrObject.type ] : [ 'aggregate','input' ];
  const idxAttribute = _.filter(modelAttributes, (attr) => {
    return attrObject.path == attr.path && attr.attribute == attrObject.attribute && objectType.indexOf(attr.type) > -1;
  });

  if(idxAttribute.length == 0){
    return [{
      code: 1,
      object: 'Attribute "' + attrObject.attribute + '" was not able to be validated, nor found in the original model structure.'
    }]
  }

  return _.map(idxAttribute, function(selectedAttr){
    return {
      code: 0,
      object: {
        values: attrObject.values,
        positions: _.map(attrObject.values, function(val){ return selectedAttr.values.indexOf(val) }),
        scale: _.merge([],selectedAttr.values),
        attribute: selectedAttr.attribute,
        path: selectedAttr.path
      }
    }
  })
}

function pickRootOnly(data){
  if(!data.alternatives || !_.isArray(data.alternatives)) return data;

  data.alternatives = _.map(data.alternatives, function(alt){
    if(!alt.evaluation ||  !_.isArray(alt.evaluation)) return alt;
    alt.evaluation = _.filter(alt.evaluation, function(eval){ return (!!eval.root ) } )
    return alt;
  })
  return data;
}

function formatChangedAndUnreliableAttributes(changedAttributes, output){
  const changed = _.keys(changedAttributes);
  const changedRegex = new RegExp( changed.join('<SEP>').replace('|','\\|').replace('<SEP>','|') );
  const changedExactRegex = new RegExp( '^(' + changed.join('<SEP>').replace('|','\\|').replace('<SEP>','|') + ')$' );

  output.evaluation = _.map(output.evaluation, function(attr){
    if( changedRegex.test(attr.path) ){
      if( changedExactRegex.test(attr.path) )
        attr.changed = true;
      else
        attr.invalid = true;
    }
    return attr;
  })

  return output;
}
//====================================================================================
