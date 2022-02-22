const TSC_BIN_PATH = "../typescript/bin/tsc";
const fs = require('fs');

if (fs.existsSync(TSC_BIN_PATH))
{
  const originalTscBin = `#!/usr/bin/env node
require('../lib/tsc.js')
`;

  fs.writeFileSync(TSC_BIN_PATH, originalTscBin);
}
