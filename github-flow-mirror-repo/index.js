const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger.js');
const { setGitActionAccess } = require('../common/git-operations.js');

async function processRepo(publicRepoUrl, org, token, newRepoName = null) {
  const octokit = github.getOctokit(token);
  const repoName = newRepoName
    ? newRepoName
    : publicRepoUrl.split('/').pop().replace('.git', '');

  // Check if the private repository already exists
  try {
    await octokit.repos.get({
      owner: org,
      repo: repoName,
    });
    logger.info(`Repository ${org}/${repoName} already exists.`);
    return;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }
  core.info(`Creating private repository ${repoName} in ${org}...`);
  // Create a private repository in the organization
  const { data: privateRepo } = await octokit.repos.createInOrg({
    org,
    name: repoName,
    visibility: 'internal',
  });

  // Clone the public repository with all tags
  execSync(`git clone --mirror ${publicRepoUrl} public-repo`);
  process.chdir('public-repo');
  logger.info('Configured Git user');
  // Configure Git user
  execSync(
    'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
  );
  execSync('git config user.name "github-actions[bot]"');

  // Set the push location to the private repository
  const remoteUrl = `https://x-access-token:${token}@github.com/${org}/${repoName}.git`;
  execSync(`git remote set-url --push origin ${remoteUrl}`);

  // Fetch updates from the original repository
  execSync('git fetch -p origin');

  // Push the updates to the private repository
  execSync('git push --mirror');

  core.setOutput('private_repo_url', privateRepo.html_url);
  const response = await setGitActionAccess(
    token,
    org,
    repoName,
    'organization',
  );
  core.info(`Response: ${response}`);
}

async function run() {
  try {
    const token = core.getInput('github_token');
    const gitRepos = core.getInput('github_repos');
    const repos = JSON.parse(gitRepos);
    const errors = [];
    for (const repo of repos) {
      const { repo: publicRepoUrl, org, newRepoName = null } = repo;
      try {
        await processRepo(publicRepoUrl, org, token, newRepoName);
      } catch (e) {
        errors.push({ publicRepoUrl, error: `${JSON.stringify(e)}` });
        logger.error(`Error processing ${publicRepoUrl}: ${JSON.stringify(e)}`);
      }
    }
    if (errors.length > 0) {
      logger.setFailed(
        `Errors processing ${errors.length} repositories: ${JSON.stringify(errors)}`,
      );
    }
  } catch (error) {
    logger.error(`Error: ${JSON.stringify(error)}`);
    logger.setFailed(error.message);
  }
}

run();