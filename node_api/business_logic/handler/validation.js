const _ = require('lodash');
const fs = require('fs');
const Ajv = require('ajv');

var exports = module.exports = {};
var ajv = new Ajv();

exports.validate = function doValidate(schema,data){
  if( _.isString(data) ) data = fs.readFileSync(data).toString();

  switch (schema.type){
    case "json": {
      if( _.isString(data) ) data = JSON.parse(data);

      var validate = exports.validatorJSON(schema.schema);
      if(!validate(data)){
        return { valid: false, error: validate.errors, data: data };
      }
    } break;
    default: {
      if( _.isString(data) ) data = JSON.parse(data);

      var validate = exports.validatorJSON(schema.schema);
      if(!validate(data)){
        return { valid: false, error: validate.errors, data: data };
      }
    }
  }

  return { valid : true }
}
exports.validatorJSON = function getValidatorJSON(schemaPath){
  if(!fs.existsSync(schemaPath)) throw new Error('Provided JSON schema file does not exists.');
  return ajv.compile(require(schemaPath));
}
