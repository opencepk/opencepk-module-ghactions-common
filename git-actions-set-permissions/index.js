const core = require('@actions/core');
const github = require('@actions/github');
const logger = require('../common/logger.js');


async function run() {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const accessLevel = core.getInput('access_level');

    const octokit = github.getOctokit(token);
    logger.info(`Setting permissions for ${owner}/${repo} to ${accessLevel}...`);
    const response = await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions/access', {
      owner: owner,
      repo: repo,
      access_level: accessLevel
    });

    logger.info(`Response: ${response.status}`);
    core.setOutput('response', response.data);
  } catch (error) {
    logger.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();