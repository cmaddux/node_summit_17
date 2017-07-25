/**
 * An instance of a simple single task worker meant to run in a
 * distributed parallel system with other task workers.
 * Will take a task off the redis todo queue, run the
 * task and sleep.
 */

const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

const { EOL } = require('os');

/**
 * Import tasks and make them available to worker
 * as references.
 */
const task1 = require('./tasks/task1');
const task2 = require('./tasks/task2');
const task3 = require('./tasks/task3');
const task4 = require('./tasks/task4');
const task5 = require('./tasks/task5');
const tasks = {
    task1,
    task2,
    task3,
    task4,
    task5
};

client.on('error', err => {
    process.stderr.write(`${err.message}${EOL}`);
    process.exit(1);
});

client.on('connect', run);

/**
 * Run worker by taking a task off of the todo
 * queue, marking it as live, running the task
 * and moving to done.
 */
function run() {

    /**
     * Retrieve ready flag (to confirm that we have
     * the ok to get to work), pop off of the todo
     * list and read the full done list.
     */
    Promise.all(
        [
            get(client, 'ready'),
            lpop(client, 'todo'),
            lrange(client, 'done', 0, -1)
        ]
    ).then(([ ready, taskLabel, done ]) => {
        if (!ready) {

            // If still need to wait on ready flag,
            // resolve to go to sleep.
            return Promise.all([
                Promise.resolve(null),
                Promise.resolve('sleep'), 
                Promise.resolve(null)
            ]);

        }

        if (!taskLabel) {
            
            // If todo list is empty, resolve to
            // exit.
            return Promise.all([
                Promise.resolve(null),
                Promise.resolve('exit'), 
                Promise.resolve(null)
            ]);

        }

        // Find task reference
        const task = tasks[taskLabel];
        if (!task) {
            
            // If unable to find reference,
            // throw error.
            throw new Error(`Unable to find reference to task ${taskLabel}`);
        }

        // If need to wait on other tasks to finish up,
        // push task back onto the todo list and
        // resolve to sleep.
        if (!depsOk(task, done)) {
            rpush(client, 'todo', taskLabel);
            return Promise.all([
                Promise.resolve(null),
                Promise.resolve('sleep'), 
                Promise.resolve(null)
            ]);

        }

        // Move work to live list.
        rpush(client, 'live', taskLabel);

        // Run task
        const clock = process.hrtime();
        return Promise.all(
            [
                Promise.resolve(clock),
                Promise.resolve(process.hrtime(clock)),
                task.run(),
                Promise.resolve(taskLabel)
            ]
        );

    }).then(([ clock, startClock, res, taskLabel ]) => {

        if (res === 'sleep' || res === 'exit') {

            // If need to sleep or exit, fall through
            return Promise.resolve(res);
        }

        // Get references to runtime.
        const endClock = process.hrtime(clock);
        const startT = (startClock[0] * 1000) + (startClock[1] / 1000000);
        const endT = (endClock[0] * 1000) + (endClock[1] / 1000000);

        debug(`label: ${taskLabel}, start: ${getTime(startT)}, end: ${getTime(endT)}`);

        // Move task from live to done
        return Promise.all([
            lrem(client, 'live', 0, taskLabel),
            rpush(client, 'done', taskLabel)
        ]);

    }).then(res => {
        if (res !== 'exit') {

            // If no exit flag, we sleep.
            return sleep();
        }

        exit();
    })
        .catch(erred);

}

/**
 * Check if dependencies resolved given a list of dependencies
 * and a list of done tasks.
 *
 * @param {Object} task - task to check
 * @param {Array<Object>} done - list of completed tasks
 *
 * @return {bool}
 */
function depsOk(task, done) {
    return task.deps
        && task.deps.every(dep => done.indexOf(dep) > -1);
}

/**
 * Exit worker.
 *
 * @return {void}
 */
function exit() {
    process.exit(0);
}

/**
 * Go to sleep for a short period of time. Then
 * start again.
 *
 * @return {void}
 */
function sleep() {
    const offset = .5 - (Math.random() * 1);
    setTimeout(run, (1000 + offset));
}

/**
 * Write error and exit.
 *
 * @param {Error} err - error
 *
 * @return {void}
 */
function erred(err) {
    process.stderr.write(`${err.message}${EOL}`);
    process.exit(1);
}

/**
 * Print a human friendly time.
 *
 * @param {int} ms - elapsed time in ms
 *
 * @return {string}
 */
function getTime(ms) {
    const m = Math.floor(ms / 1000 / 60);
    let remain = ms % (1000 * 60);
    const s = Math.floor(remain / 1000);
    const msT = ms % 1000;
    
    const mStr = m ? m + ' min ' : '';
    const sStr = s ? s + ' sec ' : '';
    const msStr = msT ? msT + ' ms' : '';
    return mStr + sStr + msStr;
}

/**
 * Print a message
 *
 * @param {string} msg - message to print
 *
 * @return {void}
 */
function debug(msg) {
    process.stdout.write(`${msg}${EOL}`);
}

/**
 * LREM redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 * @param {int} count - removal count flag
 * @param {mixed} value - value to remove
 *
 * @return {Promise}
 */
function lrem(client, key, count, value) {
    return new Promise((resolve, reject) => {
        client.lrem(key, count, value, redisHandler(resolve, reject));
    });

}

/**
 * LRANGE redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 * @param {int} start - range start
 * @param {int} end - range end
 *
 * @return {Promise}
 */
function lrange(client, key, start, end) {
    return new Promise((resolve, reject) => {
        client.lrange(key, start, end, redisHandler(resolve, reject));
    });

}

/**
 * RPUSH redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 * @param {mixed} value - value to push
 *
 * @return {Promise}
 */
function rpush(client, key, value) {
    return new Promise((resolve, reject) => {
        client.rpush(key, value, redisHandler(resolve, reject));
    });

}

/**
 * LPOP redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 *
 * @return {Promise}
 */
function lpop(client, key) {
    return new Promise((resolve, reject) => {
        client.lpop(key, redisHandler(resolve, reject));
    });

}

/**
 * GET redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 *
 * @return {Promise}
 */
function get(client, key) {
    return new Promise((resolve, reject) => {
        client.get(key, redisHandler(resolve, reject));
    });

}

/**
 * Handler to resolve or reject results of redis command.
 *
 * @param {Function} resolve - resolve promise
 * @param {Function} reject - reject promise
 *
 * @return {Promise}
 */
function redisHandler(resolve, reject) {
    return (err, res) => {
        if (err) {
            return reject(err);
        }

        resolve(res);
    };

}
