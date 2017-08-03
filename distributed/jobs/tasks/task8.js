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
        console.log('STARTING TASK 8');
        setTimeout(() => {
            console.log('ENDING TASK 8');
            resolve();
        }, Math.random() * 120000);

    });

}
