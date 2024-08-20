const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');
const branchName = 'update-submodules';

async function run() {
  try {
    const token = core.getInput('token');

    // Read the pattern from META-REPO-PATTERNS in the .github folder
    const patternPath = path.join(
      process.env.GITHUB_WORKSPACE,
      '.github',
      'META-REPO-PATTERNS',
    );
    const pattern = fs.readFileSync(patternPath, 'utf8').trim();
    logger.info(`Pattern: ${pattern}`);

    // Get the repository owner and name from the context
    const repoOwner = github.context.repo.owner;
    const repoName = github.context.repo.repo;
    logger.info(`Repository owner: ${repoOwner} Repository name: ${repoName}`);

    // Read the .gitmodules file and count the number of submodules
    const gitmodulesPath = path.join(
      process.env.GITHUB_WORKSPACE,
      '.gitmodules',
    );
    let submoduleCount = 0;
    let existingSubmodules = [];

    if (fs.existsSync(gitmodulesPath)) {
      const gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
      existingSubmodules = (gitmodulesContent.match(/path = (.+)/g) || []).map(
        line => line.split(' = ')[1].trim(),
      );
      submoduleCount = existingSubmodules.length;
    }

    logger.info(`Number of submodules: ${submoduleCount}`);

    // Calculate the starting page
    const perPage = 100;
    const startPage =
      submoduleCount > 0 ? Math.ceil(submoduleCount / perPage) : 1;
    logger.info(
      `Starting page should be : ${startPage} if we want to save some API calls`,
    );

    // Get the list of repositories in the organization with pagination
    const octokit = github.getOctokit(token);
    let repos = [];
    let page = 1;
    let response;

    do {
      response = await octokit.rest.repos.listForOrg({
        org: repoOwner,
        per_page: perPage,
        page: page,
        sort: 'created',
        direction: 'asc',
      });
      repos = repos.concat(response.data); // Concatenate the response data to the repos array
      page++;
    } while (response.data.length === perPage);
    logger.info(
      `Total number of repositories in the organization: ${repos.length}`,
    );

    // Filter repositories that match the pattern and start with "cepk"
    const matchingRepos = repos.filter(repo => repo.name.includes(pattern) && repo.name !== repoName);

    // Delete the branch if it exists
    try {
      execSync(`git push origin --delete ${branchName} || true`);
      // Delete the branch locally, ignoring errors
      execSync(`git branch -D ${branchName} || true`);
    } catch (error) {
      logger.warn(
        `Branch ${branchName} does not exist or could not be deleted.`,
      );
      logger.error(JSON.stringify(error));
    }

    // Create the branch
    execSync(`git checkout -b ${branchName}`);

    // Remove submodules that do not match any repository in the fetched list
    existingSubmodules.forEach(submodulePath => {
      const repoName = path.basename(submodulePath);
      if (!matchingRepos.some(repo => repo.name === repoName)) {
        execSync(`git submodule deinit -f ${submodulePath} || true`);
        execSync(`git rm -f ${submodulePath} || true`);
        execSync(`rm -rf .git/modules/${submodulePath} || true`);
        execSync(`rm -rf ${submodulePath} || true`);
        logger.info(`Removed submodule ${submodulePath}`);
      }
    });

    // Add matching repositories as submodules
    matchingRepos.forEach(repo => {
      const submodulePath = path.join('modules', repo.name);
      if (!fs.existsSync(submodulePath)) {
        execSync(
          `git submodule add https://github.com/${repoOwner}/${repo.name}.git ${submodulePath}`,
        );
      } else {
        logger.info(`Submodule ${submodulePath} already exists, skipping.`);
      }
    });

    // Commit the changes
    execSync('git config --global user.email "default-user@example.com"');
    execSync('git config --global user.name "Default User"');
    execSync('git add .');

    try {
      execSync('git commit -m "chore/bot-update-submodule Update submodules for matching repositories"');
    } catch (error) {
      logger.warn('No changes to commit');
      logger.error(JSON.stringify(error));
      return;
    }

    const prTitle = 'Update submodules for matching repositories';
    const prBody =
      'This PR updates submodules for repositories matching the pattern in META-REPO-PATTERNS.';

    execSync(`git push origin ${branchName}`);

    // Create the pull request
    await octokit.rest.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: 'main',
    });
  } catch (error) {
    logger.setFailed(error.message);
  }
}

run();