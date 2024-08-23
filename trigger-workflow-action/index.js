const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token');
    const repo = core.getInput('repo');
    const workflow_id = core.getInput('workflow_id');
    const ref = core.getInput('ref');
    const inputs = core.getInput('inputs');

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      core.setFailed('Invalid repo format. Expected format: owner/repo');
      return;
    }

    const octokit = github.getOctokit(token);

    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo: repoName,
      workflow_id,
      ref,
      inputs: JSON.parse(inputs),
    });

    core.info(`Successfully triggered workflow ${workflow_id} on ${repo}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();