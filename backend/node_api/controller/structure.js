var exports = module.exports = {}

const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const db = require('../config/database');
const libHandler = require('../business_logic/handler/library');
const procHandler = require('../business_logic/handler/process');
const outputHandler = require('../business_logic/handler/output');
const taskConfig = require('../config/tasks');

// Function that get inputs from a model with corresponding DEX library
exports.getModelInputs = async function doGetModelInputs(req,res){
  try {
    var processGrammarEntry = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "get_inputs", "java");

    var output = await libHandler.execute(
      processGrammarEntry, //grammar object
      undefined // additional params
    );

    if(output.code != 0){
      res.status(400).send(output);
      return;
    }

    res.status(200).send(output);
  } catch (e) {
    res.status(400).send(outputHandler.formatCatchedError(e));
  }
}

// Function that get all attributes from a model with corresponding DEX library
exports.getModelAttributes = async function doGetModelAttributes(req,res){
  try {
    var processGrammarEntry = libHandler.prepareExecution(taskConfig.getModel("_",req.params.model), "get_attributes", "java");

    var output = await libHandler.execute(
      processGrammarEntry, //grammar object
      undefined // additional params
    );

    if(output.code != 0){
      res.status(400).send(output);
      return;
    }

    res.status(200).send(output);
  } catch (e) {
    res.status(400).send(outputHandler.formatCatchedError(e));
  }
}
