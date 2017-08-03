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
        console.log('STARTING TASK 16');
        setTimeout(() => {
            console.log('ENDING TASK 16');
            resolve();
        }, Math.random() * 120000);

    });

}
