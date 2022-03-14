function debugLog(msg)
{
  if (process.env.TSC_RUN_SCRIPTS_HOOK_DEBUG)
  {
    console.log(`[tsc-run-scripts-hook] ${msg}`);
  }
}

module.exports = {
  debugLog,
};
