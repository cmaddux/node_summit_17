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
        console.log('STARTING TASK 5');
        setTimeout(() => {
            console.log('ENDING TASK 5');
            resolve();
        }, Math.random() * 120000);

    });

}
