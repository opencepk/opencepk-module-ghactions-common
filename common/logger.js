// const core = require('@actions/core');

// const red = '\x1b[31m';
// const blue = '\x1b[34m';
// const green = '\x1b[32m';
// const reset = '\x1b[0m';

// function error(message) {
//   core.error(`${red}${message}${reset}`);
// }

// function info(message) {
//   core.info(`${blue}${message}${reset}`);
// }å

// function debug(message) {
//   core.debug(`${green}${message}${reset}`);
// }

// function setFailed(message) {
//   core.setFailed(`${red}${message}${reset}`);
// }

// module.exports = {
//   error,
//   info,
//   debug,
//   setFailed,
// };

import * as core from '@actions/core';

const red = '\x1b[31m';
const blue = '\x1b[34m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

export function error(message) {
  core.error(`${red}${message}${reset}`);
}

export function info(message) {
  core.info(`${blue}${message}${reset}`);
}

export function debug(message) {
  core.debug(`${green}${message}${reset}`);
}

export function setFailed(message) {
  core.setFailed(`${red}${message}${reset}`);
}