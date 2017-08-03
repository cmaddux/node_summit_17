module.exports = {
    run
};

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    return new Promise(resolve => {
        console.log('STARTING TASK 9');
        setTimeout(() => {
            console.log('ENDING TASK 9');
            resolve();
        }, Math.random() * 120000);

    });

}
