module.exports = {
    run,
    deps: [ 'task11' ]
};

/**
 * Task runner.
 *
 * @return {void}
 */
function run() {
    return new Promise(resolve => {
        console.log('STARTING TASK 2');
        setTimeout(() => {
            console.log('ENDING TASK 2');
            resolve();
        }, Math.random() * 120000);

    });

}
