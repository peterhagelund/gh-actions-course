const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const name = 'js-dependency-update';
const configureGit = async () => {
  await execute(`git config --global user.name automation`);
  await execute(`git config --global user.email automation@nowhere.org`);
}
const validateBranchName = ({ branchName }) => /^[a-zA-Z0-9_\-\./]+$/.test(branchName)
const validateDirectoryName = ({ directoryName }) => /^[a-zA-Z0-9_\-/]+$/.test(directoryName)
const getInputs = () => {
  const baseBranch = core.getInput('base-branch', { required: true });
  const headBranch = core.getInput('head-branch', { required: true });
  const gitHubToken = core.getInput('github-token', { required: true });
  const workingDirectory = core.getInput('working-directory', { required: true });
  const debug = core.getBooleanInput('debug');
  core.setSecret(gitHubToken);
  if (!validateBranchName({ branchName: baseBranch })) {
    throw new Error(`The base-branch ${baseBranch} is invalid`);
  }
  if (!validateBranchName({ branchName: headBranch })) {
    throw new Error(`The head-branch ${headBranch} is invalid`);
  }
  if (!validateDirectoryName({ directoryName: workingDirectory })) {
    throw new Error(`The working-directory ${workingDirectory} is invalid`);
  }
  if (debug) {
    core.info(`[${name}]: base-branch is ${baseBranch}`);
    core.info(`[${name}]: target-branch is ${headBranch}`);
    core.info(`[${name}]: working-directory is ${workingDirectory}`);
  }
  return {
    baseBranch: baseBranch,
    headBranch: headBranch,
    gitHubToken: gitHubToken,
    workingDirectory: workingDirectory,
    debug: debug
  };
}

async function run() {
  var inputs;
  try {
    inputs = getInputs()
  } catch (e) {
    setFailed(e.message);
    return;
  }
  const execOptions = {
    cwd: inputs.workingDirectory
  };
  const exitCode = await exec.exec('npm update', [], execOptions);
  if (exitCode != 0) {
    setFailed(`[${name}]: command "npm update" failed with exit code ${exitCode}`);
    return;
  }
  const gitStatus = await exec.getExecOutput(`git status -s package*.json`, [], execOptions);
  if (gitStatus.exitCode != 0) {
    setFailed(`[j${name}]: command "git status -s" failed with exit code ${exitCode}`);
    return;
  }
  if (gitStatus.stdout.length == 0) {
    info(`[${name}]: There are no updates at this time`);
    return;
  }
  info(`[${name}]: There are updates available`);
  await configureGit();
  await exec.exec(`git checkout -b ${headBranch}`, [], execOptions);
  await exec.exec(`git add package.json package-lock.json`, [], execOptions);
  await exec.exec(`git commit -m "chore: update dependencies"`, [], execOptions);
  await exec.exec(`git push -u origin ${headBranch} --force`, [], execOptions);
  const octokit = github.getOctokit(gitHubToken);
  try {
    await octokit.rest.pulls.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      title: `Update NPM dependencies`,
      body: `This PR updates the NPM packages`,
      base: baseBranch,
      head: headBranch
    });
  } catch (e) {
    error(e.message);
    setFailed(`[${name}]: Failed to create PR`);
  }
}

run()
