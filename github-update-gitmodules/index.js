const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

async function run() {
  try {
    const token = core.getInput('token');

    // Read the pattern from META-REPO-PATTERNS in the .github folder
    const patternPath = path.join(__dirname, '.github', 'META-REPO-PATTERNS');
    const pattern = fs.readFileSync(patternPath, 'utf8').trim();
    logger.info(`Pattern: ${pattern}`);

    // Get the repository owner and name from the context
    const repoOwner = github.context.repo.owner;
    const repoName = github.context.repo.repo;
    logger.info(`Repository owner: ${repoOwner} Repository name: ${repoName}`);

    // Read the .gitmodules file and count the number of submodules
    const gitmodulesPath = path.join(__dirname, '.gitmodules');
    let submoduleCount = 0;

    if (fs.existsSync(gitmodulesPath)) {
      const gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
      submoduleCount = (gitmodulesContent.match(/^\[submodule /gm) || [])
        .length;
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
    //  let page = startPage;
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
      repos = repos.concat(response.data);
      page++;
    } while (response.data.length === perPage);

    // Filter repositories that match the pattern and start with "cepk"
    const matchingRepos = repos.filter(
      repo => repo.name.startsWith('cepk') && repo.name.includes(pattern),
    );

    // Add matching repositories as submodules
    matchingRepos.forEach(repo => {
      execSync(
        `git submodule add https://github.com/${repoOwner}/${repo.name}.git modules/${repo.name}`,
      );
    });

    // Commit the changes
    execSync('git config --global user.email "default-user@example.com"');
    execSync('git config --global user.name "Default User"');
    execSync('git add .');
    execSync('git commit -m "Add submodules for matching repositories"');
    execSync('git push origin main');

    const branchName = 'update-submodules';
    const prTitle = 'Add submodules for matching repositories';
    const prBody =
      'This PR adds submodules for repositories matching the pattern in META-REPO-PATTERNS.';

    // Delete the branch if it exists
    try {
      execSync(`git push origin --delete ${branchName}`);
    } catch (error) {
      logger.warn(
        `Branch ${branchName} does not exist or could not be deleted.`,
      );
      logger.error(JSON.stringify(error));
    }

    // Create the branch
    execSync(`git checkout -b ${branchName}`);
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
