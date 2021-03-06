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
        console.log('STARTING TASK 14');
        setTimeout(() => {
            console.log('ENDING TASK 14');
            resolve();
        }, Math.random() * 120000);

    });

}
