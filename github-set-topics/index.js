const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs-extra');
const path = require('path');

async function run() {
  try {
    const token = core.getInput('github-token');
    const propertiesFile = core.getInput('properties-file') || '.project-properties.json';
    const octokit = github.getOctokit(token);
    const repo = core.getInput('repo') || github.context.repo.repo;
    const owner = core.getInput('org') || github.context.repo.owner;

    const filePath = path.join(process.cwd(), propertiesFile);

    if (!fs.existsSync(filePath)) {
      core.setFailed(`${propertiesFile} file does not exist`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const properties = JSON.parse(fileContent);

    const topics = properties.map(prop => prop.replacement)
      .filter(topic => /^[a-z0-9][a-z0-9-]{0,49}$/.test(topic)); // Validate topics

    if (topics.length === 0) {
      core.setFailed('No valid topics found');
      return;
    }

    await octokit.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: topics
    });

    core.info(`Successfully added topics: ${topics.join(', ')}`);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();