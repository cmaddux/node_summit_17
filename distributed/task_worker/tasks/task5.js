module.exports = { run };

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    console.log('STARTING TASK 5');
    setTimeout(() => {
        console.log('ENDING TASK 5');
    }, Math.random() * 2000);
}
