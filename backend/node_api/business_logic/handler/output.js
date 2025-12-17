const _ = require('lodash');

var exports = module.exports = {};

exports.formatCatchedError = function doFormatCatchedError(e, code){
  return {
    code: code || 100,
    error: e.message,
    stack: e.stack
  }
}
exports.formatOutput = function doFormatOutput(data, warnings, errors, code){
  var output = {};

  if(!!data) {
    output.code = code || 0;
    output.data = data;
  }

  if(!!warnings && _.keys(warnings).length > 0) { //
    output.warning = warnings;
  }

  if(!!errors){
    output.code = code || 1;
    output.error = errors;
  }

  return output;
}
