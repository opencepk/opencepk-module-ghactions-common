const github = require('@actions/github');
const logger = require('./logger.js');

async function setGitActionAccess(token, owner, repo, accessLevel) {
  try {
    const octokit = github.getOctokit(token);
    logger.info(
      `Setting permissions for ${owner}/${repo} to ${accessLevel}...`,
    );
    const response = await octokit.request(
      'PUT /repos/{owner}/{repo}/actions/permissions/access',
      {
        owner: owner,
        repo: repo,
        access_level: accessLevel,
      },
    );

    logger.info(`Response: ${response.status}`);
    return response.data;
  } catch (error) {
    logger.setFailed(`Action failed with error: ${error.message}`);
    throw error;
  }
}

module.exports = { setGitActionAccess };
