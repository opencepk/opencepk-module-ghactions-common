const core = require('@actions/core');
const styles = require('ansi-styles');
console.log('Styles:', styles); // Debug statement to check the import
console.log('zxxxxx:', JSON.stringify(styles)); // Debug statement to check the import
const red = '\x1b[31m';
// const blue = '\x1b[34m';
const blue = styles.color.ansi16m(...styles.hexToRgb('#abcdef'));
const green = '\x1b[32m';
const reset = '\x1b[0m';

function error(message) {
  core.error(`${red}${message}${reset}`);
}

function info(message) {
  core.info(`${blue}${message}${reset}`);
}

function debug(message) {
  core.debug(`${green}${message}${reset}`);
}

function setFailed(message) {
  core.setFailed(`${red}${message}${reset}`);
}

module.exports = {
  error,
  info,
  debug,
  setFailed,
};
