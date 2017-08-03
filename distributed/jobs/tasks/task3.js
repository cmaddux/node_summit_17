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
        console.log('STARTING TASK 3');
        setTimeout(() => {
            console.log('ENDING TASK 3');
            resolve();
        }, Math.random() * 120000);

    });

}
