const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger.js');

async function run() {
  try {
    logger.info('Starting the sync process...');
    const token = core.getInput('github_token');
    const octokit = github.getOctokit(token);
    const context = github.context;
    const repo = context.repo.repo;
    const owner = context.repo.owner;

    logger.info(`Repository: ${owner}/${repo}`);
    // Read the UPSTREAM file
    const upstreamFilePath = path.join('.github', 'UPSTREAM');
    logger.info(`Reading UPSTREAM file from: ${upstreamFilePath}`);
    const upstreamUrl = fs.readFileSync(upstreamFilePath, 'utf8').trim();
    logger.info(`Upstream URL: ${upstreamUrl}`);

    // Clone the upstream repository
    logger.info('Cloning the upstream repository...');
    execSync(`git clone ${upstreamUrl} upstream-repo`);
    process.chdir('upstream-repo');

    // Fetch the latest changes from the upstream repository
    logger.info('Fetching latest changes from the upstream repository...');
    execSync('git fetch origin');
    const upstreamCommit = execSync('git rev-parse origin/main')
      .toString()
      .trim();
    logger.info(`Upstream commit: ${upstreamCommit}`);

    // Go back to the original repository
    process.chdir('..');

    // Clone the private repository
    logger.info('Cloning the private repository...');
    execSync(
      `git clone https://x-access-token:${token}@github.com/${owner}/${repo}.git private-repo`,
    );
    process.chdir('private-repo');

    // Fetch the latest changes from the private repository
    logger.info('Fetching latest changes from the private repository...');
    execSync('git fetch origin');
    const privateCommit = execSync('git rev-parse origin/main')
      .toString()
      .trim();
    logger.info(`Private commit: ${privateCommit}`);

    // Check if there are new changes in the upstream repository
    if (upstreamCommit === privateCommit) {
      logger.info('No new changes in the upstream repository.');
      return;
    }

    // Close all open pull requests in the private repository
    logger.info('Closing all open pull requests in the private repository...');
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });

    for (const pr of pullRequests) {
      await octokit.pulls.update({
        owner,
        repo,
        pull_number: pr.number,
        state: 'closed',
      });
      logger.info(`Closed PR #${pr.number}`);
    }

    // Create a new branch for the changes
    const branchName = `bot-sync-upstream`;
    logger.info(`Deleting branch if it exists: ${branchName}`);
    execSync(`git branch -D ${branchName} || true`);
    logger.info(`Creating a new branch: ${branchName}`);
    execSync(`git checkout -b ${branchName}`);

    // Configure Git user globally
    logger.info('Configuring Git user...');
    execSync(
      'git config --global user.email "github-actions[bot]@users.noreply.github.com"',
    );
    execSync('git config --global user.name "github-actions[bot]"');

    // Merge the changes from the upstream repository
    try {
      logger.info('Adding and fetching the upstream repository...');
      execSync(`git remote add upstream ../upstream-repo`);
      execSync('git fetch upstream');
      logger.info('Merging changes from the upstream repository...');
      execSync('git merge upstream/main --allow-unrelated-histories');
    } catch (e) {
      logger.debug('Error during merge process');
      logger.debug(JSON.stringify(e));
      if (e.message.includes('No commits between')) {
        logger.info('No new commits to create a pull request.');
        return;
      } else {
        throw e;
      }
    }

    // Push the new branch to the private repository
    logger.info(`Pushing the new branch: ${branchName}`);
    execSync(`git push origin ${branchName}`);

    try {
      // Create a new pull request with the changes
      logger.info('Creating a new pull request...');
      const { data: newPr } = await octokit.pulls.create({
        owner,
        repo,
        title: 'Sync with upstream',
        head: branchName,
        base: 'main',
        body: 'This PR brings in the latest changes from the upstream repository.',
      });
      logger.info(`Created new PR #${newPr.number}`);
    } catch (e) {
      logger.debug('Error during pull request creation');
      logger.debug(JSON.stringify(e));
      if (e.message.includes('No commits between')) {
        logger.info('No new commits to create a pull request.');
      } else {
        throw e;
      }
    }
  } catch (error) {
    logger.setFailed(error.message);
  }
}

run();
