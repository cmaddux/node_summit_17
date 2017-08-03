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
        console.log('STARTING TASK 12');
        setTimeout(() => {
            console.log('ENDING TASK 12');
            resolve();
        }, Math.random() * 120000);

    });

}
