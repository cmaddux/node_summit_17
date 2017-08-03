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
        console.log('STARTING TASK 13');
        setTimeout(() => {
            console.log('ENDING TASK 13');
            resolve();
        }, Math.random() * 120000);

    });

}
