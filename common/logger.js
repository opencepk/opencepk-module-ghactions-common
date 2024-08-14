/**
 * @namespace logger
 */
const core = require('@actions/core');

const red = '\x1b[31m';
const blue = '\x1b[34m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

/**
 * Logs an error message.
 *
 * @memberof logger
 * @param {string} message - The error message to log.
 */
function error(message) {
  core.error(`${red}${message}${reset}`);
}

/**
 * Logs an informational message.
 *
 * @memberof logger
 * @param {string} message - The informational message to log.
 */
function info(message) {
  core.info(`${blue}${message}${reset}`);
}

/**
 * Logs a debug message.
 *
 * @memberof logger
 * @param {string} message - The debug message to log.
 */
function debug(message) {
  core.debug(`${green}${message}${reset}`);
}

/**
 * Sets the action as failed with a message.
 *
 * @memberof logger
 * @param {string} message - The failure message to log.
 */
function setFailed(message) {
  core.setFailed(`${red}${message}${reset}`);
}

module.exports = {
  error,
  info,
  debug,
  setFailed,
};
