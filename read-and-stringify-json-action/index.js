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

    let properties = [];

    if (fs.existsSync(absolutePath)) {
      const fileContent = fs.readFileSync(absolutePath, 'utf8');

      switch (fileType) {
        case 'json':
          properties = JSON.parse(fileContent);
          break;
        case 'yml':
        case 'yaml':
          properties = yaml.load(fileContent);
          break;
        case 'file':
        default:
          properties = fileContent
            .split(separator)
            .map(line => line.trim())
            .filter(line => line !== '');
          break;
      }
    }

    let propertiesStringified;
    if (fileType === 'json' || fileType === 'yml' || fileType === 'yaml') {
      propertiesStringified = JSON.stringify(properties).replace(/"/g, '\\"');
    } else {
      propertiesStringified = properties.join(outputFormat);
    }

    core.info(`Processed properties: ${propertiesStringified}`);
    core.setOutput('properties', propertiesStringified);
    core.info(
      `Successfully read and processed ${fileType} data from ${filePath}`,
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
