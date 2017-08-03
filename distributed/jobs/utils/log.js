const { EOL } = require('os');

module.exports = {
    debug
};

/**
 * Print a message
 *
 * @param {string} msg - message to print
 *
 * @return {void}
 */
function debug(msg) {
    process.stdout.write(`${msg}${EOL}`);
}
