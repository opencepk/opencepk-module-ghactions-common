const core = require('@actions/core');
const github = require('@actions/github');

// import * as github from '@actions/github';
// import * as logger from '../dist/logger.js';
// import * as core from '@actions/core';

async function run() {
  try {
    const token = core.getInput('github-token');
    const octokit = github.getOctokit(token);
    const context = github.context;

    // eslint-disable-next-line eqeqeq
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found in the context.');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const headBranch = context.payload.pull_request.head.ref;

    await octokit.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      title: headBranch,
    });

    core.info(`Pull request title updated to: ${headBranch}`);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
