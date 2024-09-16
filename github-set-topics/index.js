const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs-extra');
const path = require('path');

async function run() {
  try {
    const token = core.getInput('github-token');
    const propertiesInput = core.getInput('properties');
    const octokit = github.getOctokit(token);
    const repoInput = core.getInput('repo'); // Expecting format org/repo

    if (!repoInput) {
      core.setFailed(
        'Input "repo" is required and should be in the format org/repo',
      );
      return;
    }

    const [owner, repo] = repoInput.split('/');

    if (!owner || !repo) {
      core.setFailed('Invalid repo format. Expected format: org/repo');
      return;
    }

    let properties;

    if (propertiesInput && propertiesInput !== '{}') {
      properties = JSON.parse(propertiesInput);
      core.info('Using properties from input');
    } else {
      core.setFailed('No properties found');
      return;
    }
    // Validate topics as Github topic has a naming rule: 1-50 length/include - but not start and end with it/only lowercase
    const topics = properties
      .map(prop => prop.replacement)
      .filter(topic => /^[a-z0-9][a-z0-9-]{0,49}$/.test(topic));

    if (topics.length === 0) {
      core.setFailed('No valid topics found');
      return;
    }

    await octokit.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: topics,
    });

    core.info(
      `Successfully added topics: ${topics.join(', ')} to ${owner}/${repo}`,
    );
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
