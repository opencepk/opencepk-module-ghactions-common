const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function run() {
  try {
    const filePath = core.getInput('file');
    const fileType = core.getInput('file_type');
    const separator = core.getInput('separator') || '\n';
    const outputFormat = core.getInput('output_format') || ',';
    const absolutePath = path.resolve(filePath);

    core.info(`File path: ${filePath}`);
    core.info(`File type: ${fileType}`);
    core.info(`Separator: ${separator}`);
    core.info(`Output format: ${outputFormat}`);
    core.info(`Absolute path: ${absolutePath}`);

    let properties = [];

    if (fs.existsSync(absolutePath)) {
      core.info(`File exists at path: ${absolutePath}`);
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      core.info(`File content: ${fileContent}`);

      switch (fileType) {
        case 'json':
          properties = JSON.parse(fileContent);
          core.info(`Parsed JSON properties: ${JSON.stringify(properties)}`);
          break;
        case 'yml':
        case 'yaml':
          properties = yaml.load(fileContent);
          core.info(`Parsed YAML properties: ${JSON.stringify(properties)}`);
          break;
        case 'file':
        default:
          properties = fileContent
            .split(separator)
            .map(line => line.trim())
            .filter(line => line !== '');
          core.info(`Parsed file properties: ${properties.join(', ')}`);
          break;
      }
    } else {
      core.warning(`File does not exist at path: ${absolutePath}`);
    }

    let propertiesStringified;
    if (fileType === 'json' || fileType === 'yml' || fileType === 'yaml') {
      propertiesStringified = JSON.stringify(properties).replace(/"/g, '\\"');
    } else {
      propertiesStringified = properties.join(outputFormat);
    }

    core.info(`Processed properties: ${propertiesStringified}`);
    core.setOutput('properties', propertiesStringified);
    core.info(`Successfully read and processed ${fileType} data from ${filePath}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();