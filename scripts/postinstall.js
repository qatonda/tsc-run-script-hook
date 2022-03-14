const TSC_BIN_PATH = "../../typescript/bin/tsc";
const fs = require('fs');
const { debugLog } = require('../src/utils');

const exists = fs.existsSync(TSC_BIN_PATH);
debugLog(`tsc exists at ${TSC_BIN_PATH}: ${exists}`);
if (exists)
{
  const newTscBin = `#!/usr/bin/env node
require('../../@qatonda/tsc-run-scripts-hook/src/index.js')
require('../lib/tsc.js')
`;

  debugLog(`wrote new tsc bin: ${newTscBin}`);
  fs.writeFileSync(TSC_BIN_PATH, newTscBin);
}
