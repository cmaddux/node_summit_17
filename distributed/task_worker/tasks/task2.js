module.exports = { run };

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    console.log('STARTING TASK 2');
    setTimeout(() => {
        console.log('ENDING TASK 2');
    }, Math.random() * 2000);
}
