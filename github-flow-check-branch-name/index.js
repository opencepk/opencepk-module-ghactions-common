const core = require('@actions/core');
const github = require('@actions/github');

// import * as github from '@actions/github';
// import * as logger from '../dist/logger.js';

try {
  // Get the pull request event payload
  const pullRequest = github.context.payload.pull_request;

  // Extract the branch name from the pull request event
  const branchName = pullRequest.head.ref;
  core.info(`Branch name: ${branchName}`);
  // Define the branch name pattern
  const branchPattern =
    /^(feat|fix|build|breaking|chore|ci|docs|perf|refactor|revert|test)\/[a-zA-Z0-9-]+$/;

  // Check if the branch name matches the pattern
  if (!branchPattern.test(branchName)) {
    core.setFailed(
      `Branch name "${branchName}" does not follow the required format such as feat/ice-123 ({type}/{issue_number}). Please rename the branch using git branch -m ${branchName} <newname>`,
    );
  } else {
    core.info(`Branch name "${branchName}" is valid.`);
  }
} catch (error) {
  core.setFailed(error.message);
}
