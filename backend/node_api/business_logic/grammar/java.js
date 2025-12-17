const _ = require('lodash');
var exports = module.exports = {}

exports.getGrammarEntry = function doGetGrammarEntry(libEntry,executable){
  var output = _.merge(_.merge({},libEntry),exports.defaults);
  output.params.push(executable);

  return output;
}

exports.defaults = {
  command: "java",
  params: ["-jar"]
}
