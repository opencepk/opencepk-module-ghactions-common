const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const token = core.getInput('github_token');
    const octokit = github.getOctokit(token);
    const context = github.context;
    const repo = context.repo.repo;
    const owner = context.repo.owner;

    // Read the UPSTREAM file
    const upstreamFilePath = path.join('.github', 'UPSTREAM');
    const upstreamUrl = fs.readFileSync(upstreamFilePath, 'utf8').trim();

    // Clone the upstream repository
    execSync(`git clone ${upstreamUrl} upstream-repo`);
    process.chdir('upstream-repo');

    // Fetch the latest changes from the upstream repository
    execSync('git fetch origin');
    const upstreamCommit = execSync('git rev-parse origin/main').toString().trim();

    // Go back to the original repository
    process.chdir('..');

    // Clone the private repository
    execSync(`git clone https://x-access-token:${token}@github.com/${owner}/${repo}.git private-repo`);
    process.chdir('private-repo');

    // Fetch the latest changes from the private repository
    execSync('git fetch origin');
    const privateCommit = execSync('git rev-parse origin/main').toString().trim();

    // Check if there are new changes in the upstream repository
    if (upstreamCommit === privateCommit) {
      console.log('No new changes in the upstream repository.');
      return;
    }

    // Close all open pull requests in the private repository
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
      console.log(`Closed PR #${pr.number}`);
    }

    // Create a new branch for the changes
    const branchName = `sync-upstream-${Date.now()}`;
    execSync(`git checkout -b ${branchName}`);

    // Configure Git user globally
    execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
    execSync('git config --global user.name "github-actions[bot]"');

    // Merge the changes from the upstream repository
    execSync(`git remote add upstream ../upstream-repo`);
    execSync('git fetch upstream');
    execSync('git merge upstream/main --allow-unrelated-histories');

    // Push the new branch to the private repository
    execSync(`git push origin ${branchName}`);

    // Create a new pull request with the changes
    const { data: newPr } = await octokit.pulls.create({
      owner,
      repo,
      title: 'Sync with upstream',
      head: branchName,
      base: 'main',
      body: 'This PR brings in the latest changes from the upstream repository.',
    });

    console.log(`Created new PR #${newPr.number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();