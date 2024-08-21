const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs-extra');
const path = require('path');

async function run() {
  try {
    const token = core.getInput('github-token');
    const propertiesInput = core.getInput('properties');
    const propertiesFile = core.getInput('properties-file') || '.project-properties.json';
    const octokit = github.getOctokit(token);
    const repo = core.getInput('repo') || github.context.repo.repo;
    const owner = core.getInput('org') || github.context.repo.owner;

    let properties;

    if (propertiesInput && propertiesInput !== '{}') {
      properties = JSON.parse(propertiesInput);
      core.info('Using properties from input');
    } else {
      const filePath = path.join(process.cwd(), propertiesFile);
      core.info(`Reading properties from file: ${filePath}`);
      if (!fs.existsSync(filePath)) {
        core.setFailed(`${propertiesFile} file does not exist`);
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      properties = JSON.parse(fileContent);
    }

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