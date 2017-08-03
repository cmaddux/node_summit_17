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
        console.log('STARTING TASK 6');
        setTimeout(() => {
            console.log('ENDING TASK 6');
            resolve();
        }, Math.random() * 120000);

    });

}
