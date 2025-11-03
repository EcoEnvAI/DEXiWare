const _ = require('lodash');
const libRegister = require('../lib/register.json');
const grammarPath = "../grammar/";
const procHandler = require('./process');
const validHandler = require('./validation');
var exports = module.exports = {};


exports.getLibrary = function doGetLibrary(name,grammar){
  var output = !!grammar ? _.filter( libRegister.pool, { name: name, grammar: grammar} ) : _.filter( libRegister.pool, { name: name } );

  //Show warnings if some libraries are not well defined!
  return output ;
}
exports.getLibrariesByOperation = function doGetLibrariesByOperation(operation,grammar){
  const default_lib_name = !!libRegister.default[operation] ? libRegister.default[operation].library : undefined;
  if(!default_lib_name) throw new Error( 'There is no default library registered for the given operation (' + operation + ')!' );

  var default_lib = exports.getLibrary(default_lib_name,grammar);
  if(default_lib.length == 0) throw new Error( 'The default library registered for the given operation (' + operation + ') cannot be found in register of libraries!' );

  if(!!libRegister.default[operation].operation) default_lib = _.map(default_lib, function(lib){ lib.operation = libRegister.default[operation].operation; return lib; })

  return default_lib;
}

exports.prepareExecution = function doPrepareExecution(models, operation, grammar, data){
  const library = exports.getLibrariesByOperation(operation,grammar)[0];
  const libSettings = require("../lib/" + library.path + "/" + library.settings);
  const libExecutor = require("../lib/" + library.path + "/" + library.executor);

  if(!libSettings) throw new Error( 'Found library registered for the given operation (' + operation + ') does not contain necessary settings file!' );
  if(!libExecutor) throw new Error( 'Found library registered for the given operation (' + operation + ') does not contain necessary executor file!' );

  var global_outcome = require(grammarPath + library.grammar).getGrammarEntry({}, __basedir + "/node_api/business_logic/lib/" + library.path + libSettings[library.grammar].executable);

  // Process array of models (singleton, bulk, or chain)
  return {
    type: models.type,
    entries: models.set.map((model) => {
      let outcome = _.extend({}, global_outcome);
      outcome.model_name = model.name;
      var customLibOutcome = libExecutor.prepare(model, library.operation, data);

      //Append validation schema path - if any
      if (!!libSettings[library.grammar].validation_schemas_path && !!libSettings[library.grammar].allowed_operations[library.operation] && !!libSettings[library.grammar].allowed_operations[library.operation].validation) {
        outcome.validation = {
          schema: __basedir + "/node_api/business_logic/lib/" + library.path + libSettings[library.grammar].validation_schemas_path + libSettings[library.grammar].allowed_operations[library.operation].validation.schema,
          type: libSettings[library.grammar].allowed_operations[library.operation].validation.type
        };
      }
      //Add object to be validated
      outcome.validate = customLibOutcome.validate;

      if (!outcome.params) outcome.params = [];
      //add params specific for the operation - if any
      if (!!customLibOutcome.params) outcome.params = _.concat(outcome.params, customLibOutcome.params);

      //add callback onOutput
      outcome.onOutput = customLibOutcome.onOutput;
      //add callback onError
      outcome.onError = customLibOutcome.onError;

      return outcome;
    })
  }
}

exports.execute = async function doExecute(processGrammarEntries, params, format){
  let global_output = {};
  let processedGrammarEntries = await Promise.all(processGrammarEntries.entries.map( doProcessGrammarEntry.bind(this, params, format) ));

  // If only one entry, then return it as a single object
  if(processedGrammarEntries.length == 1) return _.omit(processedGrammarEntries[0],'model_name');

  //Otherwise, sort out the global outcome
  global_output.code = _.filter(processedGrammarEntries,(entry) => { return entry.code > 0; }).length > 0 ? 100 : 0;
  global_output.data = _.map(_.filter(processedGrammarEntries,(entry) => { return entry.code == 0; }), (entry) => { return _.assign({ model_name: entry.model_name }, entry.data);  });
  if(global_output.code > 0) global_output.error = _.map(_.filter(processedGrammarEntries,(entry) => { return entry.code > 0; }), (entry) => { return _.assign({ model_name: entry.model_name }, _.omit(entry,'data')  );  });

  return global_output;
}

async function doProcessGrammarEntry(params, format, processGrammarEntry){
  let output = {};

  output.model_name = processGrammarEntry.model_name;
  if (!!processGrammarEntry.validate && !!processGrammarEntry.validation) {
    const validation = validHandler.validate(processGrammarEntry.validation, processGrammarEntry.validate);

    if (!validation.valid) {
      output.code = 101; // input not-validated
      output.message = 'Provided input failed to be validated, thus does not comply with the expected format.';
      output.error = validation.error;
      output.data = validation.data;

      if (!!processGrammarEntry.onError) processGrammarEntry.onError();
      return output;
    }
  }

  var processOutput = await procHandler.run(processGrammarEntry, params || []);
  output.code = processOutput.code;

  if (processOutput.code != 0) {
    output.error = processOutput.error.message || 'System reported unspecified error!'
    if (!!processGrammarEntry.onError) processGrammarEntry.onError();
    return output;
  }

  if (!!processGrammarEntry.onOutput) {
    output.data = processGrammarEntry.onOutput(processOutput);
  } else {
    output.data = processOutput;
  }

  //If 'format' function provided, format output
  if (!!format && _.isFunction(format)) output.data = format(output.data);

  //ADD here VALIDATION OF RETURN OBJECTS (if necessary)
  return output; // code 0 - no error, otherwise there is an error
}
