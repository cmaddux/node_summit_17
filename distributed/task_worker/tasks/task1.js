module.exports = { run };

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    console.log('STARTING TASK 1');
    setTimeout(() => {
        console.log('ENDING TASK 1');
    }, Math.random() * 2000);
}
