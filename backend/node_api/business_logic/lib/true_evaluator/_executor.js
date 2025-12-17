const _ = require('lodash');
const fs = require('fs');
const settings = require('./_settings.json');
var exports = module.exports = {};

/*
* Inputs:
*  - model => object that contains necessary information on model to be used (DEX or some other type)
*  - operation => operation that need to be performed. This is locally named (specific to the library) operation
*  - data => object that has been received and need to be processed
* Output:
*  - JSON object => format { params: <object with parameters to be provided to the call | MANDATORY>,
*                            validate: <object/file to be validated before execution | OPTIONAL>,
*                            "onOutput": <function to be executed if successful execution | OPTIONAL>,
*                            "onError": <function to be executed if error occurred during execution | OPTIONAL> }
* */
exports.prepare = function doPrepare(model,operation,data){
  //console.log(operation);
  switch (operation) {
    case "evaluation": return prepareEvaluation(model,data);
    case "partial_evaluation": return preparePartialEvaluation(model,data);
    case "list_inputs": return prepareListInput('list_inputs', model);
    case "list_model": return prepareListInput('list_model', model);
    case "generation": return prepareGeneration(model,data);
  }
}


//--------------------------------------
function prepareEvaluation(model,data){
  var params = [];
  var payload = {};

  payload.operation = "evaluation";
  payload.output = "flat";
  payload.model = model.name;
  payload.model_path = model.path;
  payload.model_path_manager = model.attr_path_manager;
  payload.alternatives = formatInput(data);

  const modelPathManager = require(payload.model_path_manager.replace(".dxi",""));
  const tempInputFileName = __tempdir + (new Date()).getTime() + "_" + Math.round((Math.random()*100000)) + "_evaluation.json";
  const tempOutputFileName = tempInputFileName.replace('.json','_output.json');

  fs.writeFileSync(tempInputFileName, JSON.stringify( payload ));

  params.push(tempInputFileName);
  params.push(tempOutputFileName);

  return { params: params, validate: tempInputFileName, "onOutput": getOutput, "onError": removeFiles };

  ////////////////
  function getOutput(result){
    var output = fs.readFileSync(tempOutputFileName);

    var output_object = _.pick(JSON.parse( output ), ["alternatives"] );
    output_object.alternatives = _.map(output_object.alternatives, function(alt){
      alt.evaluation = _.map(alt.evaluation, function(eval){
        eval.root = (eval.path.split(eval.path.charAt(0)).length == 2);
        if(!!modelPathManager && !!modelPathManager.getName) {
          eval.attribute = modelPathManager.getName(eval.attribute);
        }
        return eval;
      });
      return alt;
    })

    removeFiles();
    return output_object;
  }
  function removeFiles(){
    try{
      if(fs.existsSync(tempInputFileName)) fs.unlinkSync(tempInputFileName);
      if(fs.existsSync(tempOutputFileName)) fs.unlinkSync(tempOutputFileName);
    } catch(err){
      console.error(err);
    }
  }
  /*
  * Input:
  *  - data => format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
  * */
  function formatInput(data){
    return _.map(data, function(alt) {
      return {
        alternative: alt.alternative,
        inputs: _.map(alt.inputs, function (input) {
          return {path: input.path, values: input.values}
        })
      }
    })
  }
}

function preparePartialEvaluation(model,data){
  var params = [];
  var payload = {};

  payload.operation = "partial_evaluation";
  payload.output = "flat";
  payload.undefined_value = "all";
  payload.model = model.name;
  payload.model_path = model.path;
  payload.model_path_manager = model.attr_path_manager;
  payload.alternatives = formatInput(data);

  const modelPathManager = require(payload.model_path_manager.replace(".dxi",""));
  const tempInputFileName = __tempdir + (new Date()).getTime() + "_" + Math.round((Math.random()*100000)) + "_partial_evaluation.json";
  const tempOutputFileName = tempInputFileName.replace('.json','_output.json');

  fs.writeFileSync(tempInputFileName, JSON.stringify( payload ));

  params.push(tempInputFileName);
  params.push(tempOutputFileName);

  return { params: params, validate: tempInputFileName, "onOutput": getOutput, "onError": removeFiles };


  ////////////////
  function getOutput(result){
    var output = fs.readFileSync(tempOutputFileName);
    removeFiles();

    var output_object = _.pick(JSON.parse( output ), ["alternatives"] );
    output_object.alternatives = _.map(output_object.alternatives, function(alt){
      alt.evaluation = _.map(alt.evaluation, function(eval){
        eval.root = (eval.path.split(eval.path.charAt(0)).length == 2);
        if(!!modelPathManager && !!modelPathManager.getName) {
          eval.attribute = modelPathManager.getName(eval.attribute);
        }
        return eval;
      });
      return alt;
    })
    return output_object;
  }
  function removeFiles(){
    try{
      if(fs.existsSync(tempInputFileName)) fs.unlinkSync(tempInputFileName);
      if(fs.existsSync(tempOutputFileName)) fs.unlinkSync(tempOutputFileName);
    } catch(err){
      console.error(err);
    }
  }
  /*
  * Input:
  *  - data => format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
  * */
  function formatInput(data){
    return _.map(data, function(alt) {
      return {
        alternative: alt.alternative,
        inputs: _.map(alt.inputs, function (input) {
          return {path: input.path, values: input.values}
        })
      }
    })
  }
}

function prepareGeneration(model,data){
  var params = [];
  var payload = {};

  payload.operation = "generation";
  payload.model = model.name;
  payload.model_path = model.path;
  payload.model_path_manager = model.attr_path_manager;
  payload.alternative = formatAlternative(data.alternative);
  payload.goal = data.goal;
  payload.generator = _.merge({},settings.java.allowed_operations[payload.operation].default_params.generator || {});

  payload.generator = _.merge(payload.generator,_.pick(payload, _.keys(payload.generator) ))
  payload.generator.constant_attributes = formatConstantAttributes(data.locked);
  payload.generator.direction = data.direction;

  if(!!settings.java.allowed_operations[payload.operation].parameter_map){
    _.forEach(settings.java.allowed_operations[payload.operation].parameter_map, function(p){
      var conditionalValue = _.get(payload,p.condition);
      _.set(payload,p.param, (p.values[conditionalValue] || p.values['_']) );
    });
  }

  const tempInputFileName = __tempdir + (new Date()).getTime() + "_" + Math.round((Math.random()*100000)) + "_evaluation.json";
  const tempOutputFileName = tempInputFileName.replace('.json','_output.json');

  fs.writeFileSync(tempInputFileName, JSON.stringify( payload ));

  params.push(tempInputFileName);
  params.push(tempOutputFileName);

  return { params: params, validate: tempInputFileName, "onOutput": getOutput, "onError": removeFiles };

  ////////////////
  function getOutput(result){
    var output = fs.readFileSync(tempOutputFileName);

    var output_object = _.pick(JSON.parse( output ), ["goal","generated"] );
    // output_object.alternatives = _.map(output_object.alternatives, function(alt){
    //   alt.evaluation = _.map(alt.evaluation, function(eval){ eval.root = (eval.path.split(eval.path.charAt(0)).length == 2); return eval;  });
    //   return alt;
    // })
    removeFiles();
    return output_object;
  }
  function removeFiles(){
    try{
      if(fs.existsSync(tempInputFileName)) fs.unlinkSync(tempInputFileName);
      if(fs.existsSync(tempOutputFileName)) fs.unlinkSync(tempOutputFileName);
    } catch(err){
      console.error(err);
    }
  }
  /*
  * Input:
  *  - data => format { alternative: "<name>", inputs: [ { attribute: <name>, path: <path>, scale: [<values>], values: [<selected value(s)>], positions: [<position of selected values>] } ]}
  * */
  function formatAlternative(data){
    return {
      alternative: data.alternative,
      inputs: _.map(data.inputs, function (input) {
        return {path: input.path, values: input.values}
      })
    }
  }

  function formatConstantAttributes(data){
    return _.map(data,'path');
  }
}
function prepareListInput(operation,model){
  var params = [];
  var payload = {};

  if(['list_inputs','list_model'].indexOf(operation) == -1) operation = "list_inputs";

  payload.operation = operation;
  payload.output = "flat";
  payload.model = model.name;
  payload.model_path = model.path;
  payload.model_path_manager = model.attr_path_manager;

  const modelPathManager = require(payload.model_path_manager.replace(".dxi",""));
  const tempInputFileName = __tempdir + (new Date()).getTime() + "_" + Math.round((Math.random()*100000)) + "_" + operation + ".json";
  const tempOutputFileName = tempInputFileName.replace('.json','_output.json');

  fs.writeFileSync(tempInputFileName, JSON.stringify( payload ));

  params.push(tempInputFileName);
  params.push(tempOutputFileName);

  return { params: params, validate: tempInputFileName, "onOutput": getOutput, "onError": removeFiles };

  ////////////////
  function getOutput(result){
    var output = fs.readFileSync(tempOutputFileName);

    output = JSON.parse( output );
    output.attributes = output['inputs'] || output['model'];
    if(!!modelPathManager && !!modelPathManager.getName) {
      output.attributes = _.map(output.attributes, function(attr){
        attr.attribute = modelPathManager.getName(attr.attribute);
        return attr;
      });
    }

    removeFiles();
    return _.pick( output, ['attributes'] );
  }
  function removeFiles(){
    try{
      if(fs.existsSync(tempInputFileName)) fs.unlinkSync(tempInputFileName);
      if(fs.existsSync(tempOutputFileName)) fs.unlinkSync(tempOutputFileName);
    } catch(err){
      console.error(err);
    }
  }
}

