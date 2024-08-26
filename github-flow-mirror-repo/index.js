const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger.js');
const { setGitActionAccess } = require('../common/git-operations.js');
const prefix = 'mirror';

async function processRepo(publicRepoUrl, org, token, newRepoName = null) {
  const octokit = github.getOctokit(token);
  let repoName = newRepoName
    ? newRepoName
    : publicRepoUrl.split('/').pop().replace('.git', '');
  repoName = `${prefix}-${repoName}`;
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

  // Clone the public repository
  execSync(`git clone ${publicRepoUrl} public-repo`);
  process.chdir('public-repo');
  logger.info('Configured Git user');
  // Configure Git user
  execSync(
    'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
  );
  execSync('git config user.name "github-actions[bot]"');

  // Add UPSTREAM file
  logger.info('Adding UPSTREAM file');
  const upstreamContent = `git@github.com:${
    publicRepoUrl.split('https://github.com/')[1]
  }.git`;
  const upstreamFilePath = path.join('.github', 'UPSTREAM');
  fs.mkdirSync(path.dirname(upstreamFilePath), { recursive: true });
  fs.writeFileSync(upstreamFilePath, upstreamContent);

  // Commit the UPSTREAM file
  logger.info('Committing UPSTREAM file');
  execSync('git add .github/UPSTREAM');
  execSync('git commit -m "Add UPSTREAM file"');

  // Add the GitHub Actions workflow file
  logger.info('Adding GitHub Actions workflow file');
  const workflowContent = `
---
name: sync-with-mirror
on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
      - name: Setup SSH Agent
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: \${{ secrets.SSH_KEY_ICE_MODULES_READONLY }}
      - name: Sync with Upstream
        uses: ${org}/mirror-opencepk-module-ghactions-common/github-flow-sync-with-mirror@fix/update-gitmodules-action
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
    `;
  const workflowFilePath = path.join(
    '.github',
    'workflows',
    'sync-with-mirror.yml',
  );
  fs.mkdirSync(path.dirname(workflowFilePath), { recursive: true });
  fs.writeFileSync(workflowFilePath, workflowContent);

  // Commit the workflow file
  logger.info('Committing workflow file');
  execSync('git add .github/workflows/sync-with-mirror.yml');
  execSync('git commit -m "Add sync-with-mirror workflow"');

  // Replace all occurrences of opencepk/opencepk-module-ghactions-common with tucowsinc/opencepk-module-ghactions-common in .github/workflows/*.yml
  logger.info(
    'Replacing opencepk/opencepk-module-ghactions-common with tucowsinc/opencepk-module-ghactions-common in .github/workflows/*.yml',
  );
  const workflowDir = path.join('.github', 'workflows');
  const files = fs.readdirSync(workflowDir);
  files.forEach(file => {
    const filePath = path.join(workflowDir, file);
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(
        /opencepk\/opencepk-module-ghactions-common/g,
        'tucowsinc/opencepk-module-ghactions-common',
      );
      fs.writeFileSync(filePath, content);
    }
  });

  // Commit the changes after replacement
  logger.info('Committing changes after replacement');
  execSync('git add .github/workflows');
  execSync('git commit -m "Replace opencepk with tucowsinc in workflow files"');

  // Replace all occurrences of git@github.com:opencepk with git@github.com:tucowsinc in .pre-commit-config.yaml
  logger.info(
    'Replacing git@github.com:opencepk with git@github.com:tucowsinc in .pre-commit-config.yaml',
  );
  const preCommitConfigPath = '.pre-commit-config.yaml';
  if (fs.existsSync(preCommitConfigPath)) {
    let preCommitContent = fs.readFileSync(preCommitConfigPath, 'utf8');
    preCommitContent = preCommitContent.replace(
      /git@github.com:opencepk/g,
      'git@github.com:tucowsinc',
    );
    fs.writeFileSync(preCommitConfigPath, preCommitContent);

    // Commit the changes after replacement
    logger.info('Committing changes to .pre-commit-config.yaml');
    execSync('git add .pre-commit-config.yaml');
    execSync(
      'git commit -m "Replace opencepk with tucowsinc in .pre-commit-config.yaml"',
    );
  } else {
    logger.info(
      '.pre-commit-config.yaml does not exist, skipping replacement.',
    );
  }

  // Set the remote URL with the token for authentication
  logger.info('Setting remote URL with token for authentication');
  const remoteUrl = `https://x-access-token:${token}@github.com/${org}/${repoName}.git`;
  execSync(`git remote set-url origin ${remoteUrl}`);
  execSync('git push --all');
  execSync('git push --tags');

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
