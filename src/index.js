// read the tsconfig.json file
const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const { execSync } = require('child_process');

// define the tsc argument that if present will cause us to skip the npm scripts.
let skipForTscArgs = ['-h', '--help', '--all', '--clean'];

// path is optional
function runScript(name, path)
{
  // prevent shell injection by detecting characters other than alphanumeric characters and a few
  // special characters (':' and '-')
  if (typeof(name) !== 'string' || name.match(/[^\w:-]/g))
  {
    throw new Error('refusing to run script due to unsafe script name: ' + name);
  }

  // prevent shell injection by detecting characters other than alphanumeric characters and a few
  // special characters (':' and '-')
  if (path && (typeof(path) !== 'string' || path.match(/[^\w-+@\./]/g)))
  {
    throw new Error('refusing to run script due to unsafe path: ' + path);
  }

  let pathArg = path ? ` -C ${path}` : '';
  let cmd = `npm${pathArg} run "${name}"`;

  console.log(`[tsc-run-scripts-hook] $ ${cmd}`)
  console.log(execSync(cmd).toString());
}

let projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
let tsconfigPath = path.resolve(projectRoot, 'tsconfig.json');
if (fs.existsSync(tsconfigPath))
{
  let tsconfig = json5.parse(fs.readFileSync(tsconfigPath));
  let runScripts = tsconfig['run-scripts'];

  // check for special skip arguments
  let shouldSkip = skipForTscArgs.map((x) => process.argv.indexOf(x)).filter(x => x >= 0).length > 0;

  // follow project references to see if that have run-scripts too
  //
  // AFAIK reference project are only built when tsc has the build flag enabled (either `-b` or `--build`)
  let isBuild = process.argv.indexOf('-b') !== -1 || process.argv.indexOf('--build') !== -1;
  if (!shouldSkip && isBuild && Array.isArray(tsconfig.references) && tsconfig.references.length > 0)
  {
    // handle reference scripts only if `-b` or `--build` is present
    let references = tsconfig.references;
    references.forEach(reference => {
      let referenceTsConfigPath = path.resolve(projectRoot, reference.path, 'tsconfig.json');
      if (fs.existsSync(referenceTsConfigPath))
      {
        let referenceTsconfig = json5.parse(fs.readFileSync(referenceTsConfigPath));
        let referenceRunScripts = referenceTsconfig['run-scripts'];
        if (Array.isArray(referenceRunScripts) && referenceRunScripts.length > 0)
        {
          reference.runScripts = referenceRunScripts;
        }
      }
    });

    // add exit handler that runs the script provided the exit code is 0 (success)
    process.on('exit', () => {
      if (process.exitCode !== 0) return;

      // run the scripts
      references.filter(ref => ref.runScripts).forEach(ref => {
        ref.runScripts.forEach(script => {
          runScript(script, ref.path);
        })
      })
    })
  }

  // run the original project scripts
  if (!shouldSkip && Array.isArray(runScripts) && runScripts.length > 0)
  {
    // add exit handler that runs the script provided the exit code is 0 (success)
    process.on('exit', () => {
      if (process.exitCode !== 0) return;

      // run the scripts
      runScripts.forEach(runScript);
    })
  }
}
