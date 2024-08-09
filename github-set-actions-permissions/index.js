const core = require('@actions/core');
const logger = require('../common/logger.js');
const { setGitActionAccess } = require('../common/git-operations.js');

async function run() {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const accessLevel = core.getInput('access_level');

    const response = await setGitActionAccess(token, owner, repo, accessLevel);
    core.setOutput('response', response);
  } catch (error) {
    logger.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
