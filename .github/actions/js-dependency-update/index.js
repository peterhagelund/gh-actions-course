const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const validateBranchName = ({ branchName }) => /^[a-zA-Z0-9_\-\./]+$/.test(branchName)
const validateDirectoryName = ({ directoryName }) => /^[a-zA-Z0-9_\-/]+$/.test(directoryName)

async function run() {
  const baseBranch = core.getInput('base-branch', { required: true });
  const targetBranch = core.getInput('target-branch', { required: true });
  const gitHubToken = core.getInput('github-token', { required: true });
  const workingDirectory = core.getInput('working-directory', { required: true });
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
  const execOptions = {
    cwd: workingDirectory
  };
  core.info(`[js-dependecy-update]: base-branch is ${baseBranch}`);
  core.info(`[js-dependecy-update]: target-branch is ${targetBranch}`);
  core.info(`[js-dependecy-update]: working-directory is ${workingDirectory}`);
  const exitCode = await exec.exec('npm update', [], execOptions);
  if (exitCode != 0) {
    core.setFailed(`[js-dependency-update]: command "npm update" failed with exit code ${exitCode}`);
    return;
  }
  const gitStatus = await exec.getExecOutput(`git status -s package*.json`, [], execOptions);
  if (gitStatus.exitCode != 0) {
    core.setFailed(`[js-dependency-update]: command "git status -s" failed with exit code ${exitCode}`);
    return;
  }
  if (gitStatus.stdout.length == 0) {
    core.info(`[js-dependency-update]: There are no updates at this time`);
    return;
  }
  core.info('[js-dependency-update]: There are updates available');
  await exec.exec(`git config --global user.name=automation`);
  await exec.exec(`git config --global user.email=automation@nowhere.org`);
  await exec.exec(`git checkout -b ${targetBranch}`, [], execOptions);
  await exec.exec(`git add package.json package-lock.json`, [], execOptions);
  await exec.exec(`git commit -m "chore: update dependencies"`, [], execOptions);
  await exec.exec(`git push -u origin ${targetBranch} --force`, [], execOptions);
  const octokit = github.getOctokit(gitHubToken);
  try {
    await octokit.rest.pulls.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      title: `Update NPM dependencies`,
      body: `This PR updates the NPM packages`,
      base: baseBranch,
      head: targetBranch
    });
  } catch (e) {
    core.error(e.message);
    core.setFailed(`[js-dependency-update]: Failed to create PR`);
  }
}

run()
