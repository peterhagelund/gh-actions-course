const core = require('@actions/core');
const exec = require('@actions/exec');

const validateBranchName = ({ branchName }) => /^[a-zA-Z0-9_\-\./]+$/.test(branchName)
const validateDirectoryName = ({ directoryName }) => /^[a-zA-Z0-9_\-/]+$/.test(directoryName)

async function run() {
  /*
  [DONE]1. Parse inputs:
    1.2 base-branch from which to check for updates
    1.2 target-branch to use to create PR
    1.3 GitHub token for auth purposes
    1.4 Working directory for which to check for dependencies
  [DONE]2. Execute npm update withing working directory
  3. Check whether there are modified package*.json files
  4. If there are modified files:
    4.1 Add and commit files to the target-branch
    4.2 Create a PR to the base-brach using the octokit API
  5. Otherwise conclude the custom action
  */
  const baseBranch = core.getInput('base-branch');
  const targetBranch = core.getInput('target-branch');
  const gitHubToken = core.getInput('github-token');
  const workingDirectory = core.getInput('working-directory');
  const debug = core.getBooleanInput('debug');
  core.setSecret(gitHubToken);
  if (!validateBranchName({ branchName: baseBranch })) {
    core.setFailed('Invalid base-branch name');
    return;
  }
  if (!validateBranchName({ branchName: targetBranch })) {
    core.setFailed('Invalid target-branch name');
    return;
  }
  if (!validateDirectoryName({ directoryName: workingDirectory })) {
    core.setFailed('Invalid working-directory name');
    return;
  }
  core.info(`[js-dependecy-update]: base-branch is ${baseBranch}`);
  core.info(`[js-dependecy-update]: target-branch is ${targetBranch}`);
  core.info(`[js-dependecy-update]: working-directory is ${workingDirectory}`);
  const exitCode = await exec.exec('npm update', [], {
    cwd: workingDirectory
  });
  if (exitCode != 0) {
    core.setFailed(`[js-dependency-update]: command "npm update" failed with exit code ${exitCode}`);
    return;
  }
  const gitStatus = await exec.getExecOutput('git status -s package*.json', [], {
    cmd: workingDirectory
  });
  if (gitStatus.exitCode != 0) {
    core.setFailed(`[js-dependency-update]: command "git status -s" failed with exit code ${exitCode}`);
    return;
  }
  if (gitStatus.stdout.length > 0) {
    core.info('[js-dependecy-update]: There are updates available');
  } else {
    core.info('[js-dependecy-update]: There are updates at this time');
  }
}

run()
