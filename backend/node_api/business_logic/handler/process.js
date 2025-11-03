const _ = require('lodash');
var exports = module.exports = {}

exports.run = function doRun(processGrammarEntry, args){

  async function spawnChild() {
    //console.log(processGrammarEntry.command,_.concat(processGrammarEntry.params, args))
    const { spawn } = require('child_process');
    const child = spawn(processGrammarEntry.command, _.concat(processGrammarEntry.params, args) );

    let data = "";
    for await (const chunk of child.stdout) {
      //console.log('stdout chunk: '+chunk);
      data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
      //console.error('stderr chunk: '+chunk);
      error += chunk;
    }
    const exitCode = await new Promise( (resolve, reject) => {
      child.on('close', resolve);
    });


    if( exitCode ) {
      throw new Error( `System reported an error with exit code ${exitCode}: ${error}`);
    }
    return data;
  }

  return spawnChild().then(
    data => { return { code: 0, data: data }; },
    err =>  { return { code: 1, error: err }; }
  );

}
