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
        console.log('STARTING TASK 20');
        setTimeout(() => {
            console.log('ENDING TASK 20');
            resolve();
        }, Math.random() * 120000);

    });

}
