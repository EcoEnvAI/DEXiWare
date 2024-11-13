var _ = require('lodash');
var exports = module.exports = {}
var terms = {
  'environmental pillar': 'EnvironmentalPillar',
  'economic pillar': 'EconomicPillar',
  'socio-policy pillar': 'Social-PolicyPillar',
  'processing': 'Processing',
  'market': 'Market',
  'consumers': 'Consumers',
  'transportation': 'Transportation',
  'production': 'Production',
  'EnvironmentalPillar###Production': 'EnvironmentalPillar###Production_EnvironmentalPillar',
  'EnvironmentalPillar###Processing': 'EnvironmentalPillar###Processing_EnvironmentalPillar',
  'EnvironmentalPillar###Transportation': 'EnvironmentalPillar###Transportation_EnvironmentalPillar',
  'EnvironmentalPillar###Market': 'EnvironmentalPillar###Market_EnvironmentalPillar',
  'EnvironmentalPillar###Consumers': 'EnvironmentalPillar###Consumers_EnvironmentalPillar',

  'EconomicPillar###Production': 'EconomicPillar###Production_EconomicPillar',
  'EconomicPillar###Processing': 'EconomicPillar###Processing_EconomicPillar',
  'EconomicPillar###Transportation': 'EconomicPillar###Transportation_EconomicPillar',
  'EconomicPillar###Market': 'EconomicPillar###Market_EconomicPillar',
  'EconomicPillar###Consumers': 'EconomicPillar###Consumers_EconomicPillar',

  'Social-PolicyPillar###Production': 'Social-PolicyPillar###Production_SocialPolicyPillar',
  'Social-PolicyPillar###Processing': 'Social-PolicyPillar###Processing_SocialPolicyPillar',
  'Social-PolicyPillar###Transportation': 'Social-PolicyPillar###Transportation_SocialPolicyPillar',
  'Social-PolicyPillar###Market': 'Social-PolicyPillar###Market_SocialPolicyPillar',
  'Social-PolicyPillar###Consumers': 'Social-PolicyPillar###Consumers_SocialPolicyPillar'
}


exports.run = doComposeAttributePath;
exports.resolve = doResolvePath;
exports.compare = doCompareAttributePath;
exports.getName = doCleanName;

function doResolvePath(path){
  const delRegExp = /(?:\/|\|)\s*/;
  return _.filter(path.split(delRegExp), Boolean ) ;
}
function doComposeAttributePath(array){
  if(!array) return;
  var formattedTerms = _.map(array || [], (x)=>{ return terms[x.toLowerCase()] || x; });
  if(!!terms[formattedTerms.join('###')]) {
    formattedTerms = terms[formattedTerms.join('###')].split('###');
  }
  return new RegExp( formattedTerms.join('\\|') + '|' + formattedTerms.join('\/') );
}
function doCompareAttributePath(array,record){
  if(!array) return true;
  //const matched = record.match(doComposeAttributePath(array));
  //return matched != null ? matched.length > 0 : false;
  return doComposeAttributePath(array).test(record);
}

function doCleanName(attrName){
  return attrName.indexOf('###') > -1 ? attrName.split('###')[0] : attrName;
}

//function doCompareAttribute(array, record, attrName, answerName){
//  var pathCheck = doCompareAttributePath(array,record);
//  var nameCheck = attrName.indexOf('###') > -1 ? attrName.split('###')[0] === answerName : attrName === answerName;
//}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
