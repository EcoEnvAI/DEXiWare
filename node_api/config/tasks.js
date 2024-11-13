const _ = require('lodash');
var exports = module.exports = {};

/*
* This configuration defines set of tasks that can be performed
* with corresponding set of models (dex or others).
* _ (underscore) - means default action (or any action)
* */

exports.config = {
  "model_repository": __basedir + "/node_api/business_logic/models/production/",
  "models": {
    "AgriFoodChainFull": { "model_name": "AgriFoodChainFull", "model_filepath": "AgriFoodChainFull.dxi", "model_type": "dex" },
    "AgriFoodChainIntegrated": { "model_name": "AgriFoodChainIntegrated", "model_filepath": "AgriFoodChainIntegrated2.dxi", "model_type": "dex" },
    "AgriFoodChainPath": { "model_name": "AgriFoodChainPath", "model_filepath": "AgriFoodChainFull.js", "model_type": "javascript" }
  },
  "tasks": {
    "_": { "default": "AgriFoodChainFull", "applicable": [ "AgriFoodChainFull", "AgriFoodChainIntegrated" ] },
    "bottom_up": { "default": "AgriFoodChainIntegrated", "applicable": [ "AgriFoodChainFull", "AgriFoodChainIntegrated" ] },
    "manage_attribute_path": { "default": "AgriFoodChainPath", "applicable": [ "AgriFoodChainPath" ] }
  },
  "tasks_OLD": {
    "_": { "model_name": "AgriFoodChain", "model_filepath": "AgriFoodChainFull.dxi", "model_type": "dex" },
    "manage_attribute_path": { "model_name": "AgriFoodChain", "model_filepath": "AgriFoodChainFull.js", "model_type": "javascript" }
  }
}
exports.getAvailableTasks = function doGetAvailableTasks(){
  return _.keys(exports.config.tasks);
}
exports.getAvailableModels = function doGetAvailableModels(){
  return _.keys(exports.config.models);
}
exports.isTaskDefined = function checkIsTaskDefined(task){
  return exports.getAvailableTasks().indexOf(task) > -1;
}
exports.isModelDefined = function checkIsModelDefined(model_name){
  return exports.getAvailableModels().indexOf(model_name) > -1;
}
exports.getModel = function doGetModel(task, model){
  if(!task) task = "_";
  if(!exports.isTaskDefined(task)) throw new Error('Provided task (' + task + ') is not defined to be performed with any model, hence it is not a valid task');
  var model_identifier = exports.config.tasks[task].default;

  if(!!model){
    if(exports.config.tasks[task].applicable.indexOf(model) == -1)
      throw new Error('Provided task (' + task + ') is defined to be performed with no allowed model (' + model + '), hence it is not a valid task');

    model_identifier = model;
  }

  if(!exports.isModelDefined(model_identifier)) throw new Error('Provided task (' + task + ') is defined to be performed with none existent model (' + model_identifier + '), hence it is not a valid task');
  const model_object = exports.config.models[model_identifier];
  return  { name: model_object.model_name, path: exports.config.model_repository + model_object.model_filepath, type: model_object.model_type }
}

