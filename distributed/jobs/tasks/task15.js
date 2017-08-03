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
        console.log('STARTING TASK 15');
        setTimeout(() => {
            console.log('ENDING TASK 15');
            resolve();
        }, Math.random() * 120000);

    });

}
