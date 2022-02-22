// read the tsconfig.json file
const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const { execSync } = require('child_process');

// define the tsc argument that if present will cause us to skip the npm scripts.
let skipForTscArgs = ['-h', '--help', '--all', '--clean'];

function runScript(name)
{
  // prevent shell injection by detecting characters other than alphanumeric characters and a few
  // special characters (':' and '-')
  if (name.match(/[^0-9a-zA-Z:-]/g))
  {
    throw new Error('refusing to run script due to unsafe script name: ' + name);
  }

  console.log(`[tsc-run-script-hook] $ npm run ${name}`)
  console.log(execSync(`npm run "${name}"`).toString());
}

let tsconfigPath = path.resolve(__dirname, '..', '..', '..', 'tsconfig.json');
if (fs.existsSync(tsconfigPath))
{
  let tsconfig = json5.parse(fs.readFileSync(tsconfigPath));
  let runScripts = tsconfig['run-scripts'];

  // check for special skip arguments
  let shouldSkip = skipForTscArgs.map((x) => process.argv.indexOf(x)).filter(x => x >= 0).length > 0;
  if (!shouldSkip && Array.isArray(runScripts) && runScripts.length > 0)
  {
    // add exit handler that runs the script provided the exit code is 0 (success)
    process.on('exit', () => {
      if (process.exitCode === 0)
      {
        // run the scripts
        runScripts.forEach(runScript);
      }
      console.log(`[tsc-run-script-hook] exit code: ${process.exitCode}`);
    })
  }
}
