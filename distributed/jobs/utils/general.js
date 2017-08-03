const { EOL } = require('os');

module.exports = {
    exit,
    erred
};

/**
 * Exit process.
 *
 * @return {void}
 */
function exit() {
    process.exit(0);
}

/**
 * Write error and exit.
 *
 * @param {Error} err - error
 *
 * @return {void}
 */
function erred(err) {
    process.stderr.write(`${err.message}${EOL}`);
    process.exit(1);
}
