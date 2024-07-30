const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Get the branch name from the GitHub context
  const branchName = github.context.ref.replace('refs/heads/', '');

  // Define the branch name pattern
  const branchPattern =
    /^(feat|fix|build|breaking|chore|ci|docs|perf|refactor|revert|test)\/[a-zA-Z0-9-]+$/;

  // Check if the branch name matches the pattern
  if (!branchPattern.test(branchName)) {
    core.setFailed(
      `Branch name "${branchName}" does not follow the required format.`,
    );
  } else {
    core.info(`Branch name "${branchName}" is valid.`);
  }
} catch (error) {
  core.setFailed(error.message);
}
