module.exports = {
    label: 'task1',
    run
};

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    return new Promise(resolve => {
        console.log('STARTING TASK 1');
        setTimeout(() => {
            console.log('ENDING TASK 1');
            resolve();
        }, Math.random() * 120000);

    });

}
