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
        console.log('STARTING TASK 10');
        setTimeout(() => {
            console.log('ENDING TASK 10');
            resolve();
        }, Math.random() * 120000);

    });

}
