const core = require('@actions/core');

async function run() {
  /*
  1. Parse inputs:
    1.2 base-branch from which to check for updates
    1.2 target-branch to use to create PR
    1.3 GitHub token for auth purposes
    1.4 Working directory for which to check for dependencies
  2. Execute npm update withing working directory
  3. Check whether there are modified package*.json files
  4. If there are modified files, create a PR to the base-brach using the target-branch
  5. Otherwise conclude the custom action
  */
  core.info('This is a custom JS action');
}

run()
