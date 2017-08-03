/**
 * An instance of a simple single task worker meant to run in a
 * distributed parallel system with other task workers.
 * Will take a task off the redis todo queue, run the
 * task and sleep.
 */

const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

const { EOL } = require('os');

const { 
    getTaskDirList,
    getTaskPaths,
    labelFromTaskPath
} = require('./utils/load');

const {
    get,
    set,
    lrem,
    lpop,
    rpush,
    lrange
} = require('./utils/redis');

const {
    exit,
    erred
} = require('./utils/general');

const { debug } = require('./utils/log');

client.on('error', erred);
client.on('connect', load);

let tasks = {};

/**
 * Run worker by taking a task off of the todo
 * queue, marking it as live, running the task
 * and moving to done.
 */
async function run() {
    try {
        const ready = await get(client, 'ready');
        if (!ready) {

            // If still need to wait on ready flag,
            // sit tight.
            return sleep();
        }

        const taskLabel = await lpop(client, 'todo');
        if (!taskLabel) {

            // If todo list is empty, we're done here.
            return exit();
        }

        const task = tasks[taskLabel];
        if (!task) {

            // If unable to find reference, something's wrong.
            throw new Error(`Unable to find reference to task ${taskLabel}`);
        }

        const done = await lrange(client, 'done', 0, -1);
        if (!depsOk(task, done)) {

            // If need to wait on other tasks to finish up,
            // requeue task and rest for a sec.
            debug(`Requeuing a task: ${taskLabel}.`);
            await rpush(client, 'todo', taskLabel);
            return sleep();
        }

        // Move work to live list.
        await rpush(client, 'live', taskLabel);

        // Run that task
        const clock = process.hrtime();
        const startClock = process.hrtime(clock);

        await Promise.resolve(task.run());

        const endClock = process.hrtime(clock);
        const startT = (startClock[0] * 1000) + (startClock[1] / 1000000);
        const endT = (endClock[0] * 1000) + (endClock[1] / 1000000);

        debug(`Finished some work: ${taskLabel}, start: ${getTime(startT)}, end: ${getTime(endT)}`);

        // Move task from live to done
        await lrem(client, 'live', 0, taskLabel),
        await rpush(client, 'done', taskLabel)

        // Rest for a sec and start all over again
        sleep();
    } catch (e) {

        // Handle that error
        erred(e);
    }

}

/**
 * Load up tasks from task directory. 
 *
 * @return {Promise}
 */
async function load() {
    try {
        const taskDirList = await getTaskDirList();    
        if (!taskDirList.length) {

            // If nothing to do, we're done
            debug('Nothing found in ./tasks.');
            return exit();
        }

        const taskPaths = await getTaskPaths(taskDirList);
        if (!taskPaths.length) {

            // Again, if nothing to do, we're done
            debug('No task files in ./tasks.');
            return exit();
        }

        // Loop over paths to task files and
        // load up each task
        taskPaths.forEach(taskPath => {
            const task = require(taskPath);
            if (!task.label) {

                // If no label defined for task, make one
                task.label = labelFromTaskPath(taskPath);
            }

            tasks[task.label] = task;
        });

    } catch (e) {

        // Handle that error
        return erred(e);
    }
        
    // Start this thing up
    run();
}

/**
 * Check if dependencies resolved given a list of dependencies
 * and a list of done tasks.
 *
 * @param {Object} task - task to check
 * @param {immutable.List} done - list of completed tasks
 *
 * @return {bool}
 */
function depsOk(task, done) {
    if (!task.deps) {
        return true;
    }

    return task.deps.every(dep => done.indexOf(dep) > -1);
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
