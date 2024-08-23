const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const filePath = core.getInput('file');
    const absolutePath = path.resolve(filePath);

    let properties = {};

    if (fs.existsSync(absolutePath)) {
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      properties = JSON.parse(fileContent);
    }

    const propertiesStringified = JSON.stringify(properties).replace(/"/g, '\\"');
    core.setOutput('properties', propertiesStringified);

    core.info(`Successfully read and stringified JSON data from ${filePath}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();