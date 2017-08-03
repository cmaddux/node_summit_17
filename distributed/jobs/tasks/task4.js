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
        console.log('STARTING TASK 4');
        setTimeout(() => {
            console.log('ENDING TASK 4');
            resolve();
        }, Math.random() * 120000);

    });

}
