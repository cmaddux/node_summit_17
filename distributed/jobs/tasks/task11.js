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
        console.log('STARTING TASK 11');
        setTimeout(() => {
            console.log('ENDING TASK 11');
            resolve();
        }, Math.random() * 120000);

    });

}
