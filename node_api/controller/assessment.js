var exports = module.exports = {}

const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const db = require('../config/database');
const libHandler = require('../business_logic/handler/library');
const procHandler = require('../business_logic/handler/process');
const outputHandler = require('../business_logic/handler/output');
const taskConfig = require('../config/tasks');
const modelPathManager = require(taskConfig.getModel('manage_attribute_path').path);

// Function that run assessment through corresponding DEX library
exports.evaluate = doEvaluate.bind(this,false);
exports.evaluateRoot = doEvaluate.bind(this,true);


/*
* Function for evaluating alternatives
* @params:
*  - root_only: [trye/false] whether to return only roots evaluated or all attributes evaluated
*  - req: express (http(s)) request object
*  - res: express (http(s)) response object
* */
async function doEvaluate(root_only,req,res){
  try{
    var response = req.body;

    if(!Array.isArray(response)) response = [ response ];
    var output = { warning: {} };

    //First get structure for the model (i.e. input value scales)
    var processGrammarEntry = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "get_attributes", "java"); //get_attributes, get_inputs
    var processOutput = await libHandler.execute(processGrammarEntry);

    if(processOutput.code != 0){
      res.status(400).send( outputHandler.formatOutput(undefined, undefined, processOutput.error, processOutput.code) );
      return;
    }

    var structure = processOutput.data;
    //var idxStructure = _.map(structure.attributes,'attribute');

    /*
    * Prepare the alternatives
    * format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
    */
    response = _.map(response, function(alternative){
      var alt = {};
      var processedAttributes = _.flatten(_.map( (alternative.assessment_answers || [] ), mapAnswerToAttribute.bind(this,structure) ));

      alt.alternative = alternative.assessment_name || 'new alternative';
      alt.inputs = _.map(_.filter(processedAttributes, { code: 0 }), "object");

      //Fill up the missing inputs with empty/full value array
      var list_attr_apth = _.map(alt.inputs,'path');
      _.forEach(structure.attributes, (str_attr) => {
        if( list_attr_apth.indexOf(str_attr.path) == -1 && str_attr.type === "input") alt.inputs.push( _.pick(str_attr,['path','values']) );
      })

      output.warning[alt.alternative] = _.concat( (output.warning[alt.alternative] || []), _.map(_.filter(processedAttributes, { code: 1 }), "object") );
      return alt;
    })

    //Process assessment evaluation
    processGrammarEntry = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "evaluate", "java", response );
    processOutput = await libHandler.execute(processGrammarEntry, undefined, !!root_only ? pickRootOnly : undefined );

    if(processOutput.code != 0){
      res.status(400).send( outputHandler.formatOutput(undefined, output.warning, processOutput.error, processOutput.code) );
      return;
    }

    res.status(200).send( outputHandler.formatOutput(processOutput.data, output.warning) );
  } catch (e) {
    res.status(400).send(outputHandler.formatCatchedError(e));
  }

}
//====================================================================================


// ----- Utility functions -------
function pickRootOnly(data){
  if(!data.alternatives || !_.isArray(data.alternatives)) return data;

  data.alternatives = _.map(data.alternatives, function(alt){
    if(!alt.evaluation ||  !_.isArray(alt.evaluation)) return alt;
    alt.evaluation = _.filter(alt.evaluation, function(eval){ return (!!eval.root ) } )
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

