/**
 * A simple task filler to get our redis todo queue
 * filled up and ready.
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
    set,
    lpush
} = require('./utils/redis');

const {
    exit,
    erred
} = require('./utils/general');

const { debug } = require('./utils/log');

client.on('error', erred);
client.on('connect', load);

/**
 * Run filler by loading tasks into todo list.
 */
async function run(tasks) {
    try {

        // Force ready flag to false
        await set(client, 'ready', false);

        // Push all tasks onto todo list
        const promises = tasks.map(task => lpush(client, 'todo', task));
        await Promise.all(promises);

        // Set ready flag
        await set(client, 'ready', true);
    } catch(e) {
        
        // Handle that error
        erred(e);
    }
    
    debug('Done loading up tasks.');
    exit();
}

/**
 * Load up tasks from task directory. 
 *
 * @return {Promise}
 */
async function load() {
    const tasks = [];
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

            tasks.push(task.label);
        });

    } catch (e) {

        // Handle that error
        return erred(e);
    }
        
    // Start this thing up
    run(tasks);
}
