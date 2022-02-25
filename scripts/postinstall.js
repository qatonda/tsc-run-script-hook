const TSC_BIN_PATH = "../../typescript/bin/tsc";
const fs = require('fs');

if (fs.existsSync(TSC_BIN_PATH))
{
  const newTscBin = `#!/usr/bin/env node
require('../../@qatonda/tsc-run-scripts-hook/src/index.js')
require('../lib/tsc.js')
`;

  fs.writeFileSync(TSC_BIN_PATH, newTscBin);
}
