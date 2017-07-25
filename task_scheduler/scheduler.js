/**
 * An example of a very simple task Node.js task scheduler.
 *
 * Given a list of tasks, the task scheduler should attempt
 * to spread the work out between child processes. Each
 * task object provided should contain at the very
 * least a path, which is the path to the task
 * runner.
 *
 * Other options can be provided to change the behavior of
 * the task scheduler.
 */

/**
 * Export a function that runs a list of tasks.
 * Since we keep a state of the entire system,
 * we should be ok to call multiple times.
 */
module.exports = schedule;

/**
 * The child process module provides us with methods to
 * spawn child processes off of the parent process.
 */
const cp = require('child_process');

const os = require('os');
const numCore = os.cpus().length;
const EOL = os.EOL;

const { List } = require('immutable');

/**
 * Schedule and run provided list of tasks.
 *
 * @param {Array<Object>} tasks - list of tasks to complete
 *
 * @return {Promise}
 */
function schedule(tasks = []) {
    debug(`${tasks.length} tasks scheduled.`);

    if (!tasks.length) {

        // If nothing to do, do nothing.
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {

        // Initialize state for this list of tasks, including
        // work todo, live work and work that has completed.
        let todo = List(prepare(tasks));
        let live = List();
        let done = List();

        /**
         * Produce a handler for all events emitted by child processes.
         * Specific event should be handled and we will exit, sit tight
         * or try to refill resources as we can.
         *
         * @param {string} label - label for task emitting ChildProcess is working on
         * @param {string} action - action for event emotted by ChildProcess
         * @param {mixed} res - data associated with emitted event
         *
         * @return {void}
         */
        const handler = (label, action, res) => {
            switch (action) {
            case 'exit':
                ({ todo, live, done } = exit(label, todo, live, done, res));
                break;
            case 'error':
                ({ todo, live, done } = error(label, todo, live, done, res));
                return reject(new Error(`Error with label ${label}: ${res}`));
            case 'close':
                ({ todo, live, done } = close(label, todo, live, done, res));
                break;
            case 'disconnect':
                ({ todo, live, done } = disconnect(label, todo, live, done));
                break;
            default:
                return;
            }

            if (!todo.size && !live.size) {

                // If we have no more work left to do and
                // nothing we're currently working on,
                // then we can resolve.
                return resolve(done);
            }

            if (!todo.size) {

                // If there's nothing left to do, but still
                // have work live, we need to sit tight.
                return;
            }

            // If still work to do, attempt to fill resources
            ({ todo, live, done } = fill(todo, live, done, handler)); 
        };

        // We start working through our tasks by filling resources
        // and providing the handler that will continue to 
        // refill resources until we are finished.
        ({ todo, live, done } = fill(todo, live, done, handler));
    });

}

/**
 * Fill resources as we can.
 *
 * @param {immutable.List} todo - list of jobs to do
 * @param {immutable.List} live - list of currently running jobs
 * @param {immutable.List} done - list of finished jobs
 * @param {Function} handler - handler for child process events
 *
 * @return {Object}
 */
function fill(todo, live, done, handler) {

    // Forces remove waiting on dependencies flag for all
    // items in todo list. If filling after an exit event
    // from a process, sonme dependencies may now be
    // resolved.
    todo = todo.map(item => Object.assign({}, item, { waiting: false }));
    
    // Start loop to attempt to fill resources. While we have work
    // to do, meaning the todo list isn't empty and while we
    // have space to work (fewer than os.Cpus child processes
    // live), fork child tasks.
    while (workToDo(todo) && spaceForWork(live)) {

        // Shift a task off of the todo list
        const task = todo.first();
        todo = todo.shift();

        // Determine if dependencies are ok. If not, requeue the task
        // and continue.
        if (!depsOk(task, done)) {
            debug(`${task.label} is being requeued.`);
            todo = todo.push(Object.assign({}, task, { waiting: true }));
            continue;
        }

        // Start child process and receive child process instance back.
        debug(`${task.label} is being forked.`);
        const child = cp.fork(task.path, task.args, task.opts);

        // Register listeners for all child process events
        child.on('exit', (...res) => handler(task.label, 'exit', res));
        child.on('close', (...res) => handler(task.label, 'close', res));
        child.on('error', (...res) => handler(task.label, 'error', res));
        child.on('disconnect', () => handler(task.label, 'disconnect'));

        // Start clock to check runtime
        const clock = process.hrtime();
        const liveObj = Object.assign(
            {},
            task,
            { 
                clock,
                process: child,
                start: process.hrtime(clock)
            }
        );

        // Mark running task as live
        live = live.push(liveObj);
    }

    return { todo, live, done };
}

/**
 * Make sure all jobs are properly formatted to be run.
 *
 * @param {Array<Object>} tasks - list of tasks to work on
 *
 * @return {Array<Object>}
 */
function prepare(tasks) {
    return tasks.map((task, index) => {
        const { label } = task;
        return Object.assign(
            {},
            task,
            { label: label || `task_${index}` }
        );

    });

}

/**
 * Move task with provided label from live list to done list
 *
 * @param {string} label - label of task to move
 * @param {immutable.List} live - list of live tasks
 * @param {string} live[].label - label of a live task
 * @param {immutable.List} done - list of finished tasks
 *
 * @return {Object}
 */
function moveToDone(label, live, done) {
    const index = live.findIndex(item => item.label === label);
    const finished = live.get(index);
    if (!finished) {
        debug(`Unable to find live task with label: ${label}.`);
        return { live, done }; 
    }

    live = live.splice(index, 1);
    done = done.push(
        Object.assign(
            {},
            finished,
            {
                process: null,
                end: process.hrtime(finished.clock)
            }
        )
    );

    return { live, done }; 
}

/**
 * Handle task with particular label exited
 *
 * @param {string} label - label of exited task
 * @param {immutable.List} todo - list of tasks to be completed
 * @param {immutable.List} live - list of live tasks
 * @param {immutable.List} done - list of finished tasks
 * @param {Array} res - arguments provided to 'exit' event
 *
 * @return {Object}
 */
function exit(label, todo, live, done) {
    debug(`${label} exited, moving to done.`);
    ({ live, done } = moveToDone(label, live, done));
    return { todo, live, done };
}

/**
 * Handle task with particular label erred
 *
 * @param {string} label - label of erred task
 * @param {immutable.List} todo - list of tasks to be completed
 * @param {immutable.List} live - list of live tasks
 * @param {immutable.List} done - list of finished tasks
 * @param {Array} res - arguments provided to 'error' event
 *
 * @return {Object}
 */
function error(label, todo, live, done) {
    debug(`${label} erred, cleaning up.`);
    live.forEach(task => {
        task.child.disconnect();
    });

    return { todo, live, done };
}

/**
 * Handle task with particular label closed
 *
 * @param {string} label - label of closed task
 * @param {immutable.List} todo - list of tasks to be completed
 * @param {immutable.List} live - list of live tasks
 * @param {immutable.List} done - list of finished tasks
 * @param {Array} res - arguments provided to 'close' event
 *
 * @return {Object}
 */
function close(label, todo, live, done) {
    debug(`${label} closed.`);
    return { todo, live, done };
}

/**
 * Handle task with particular label disconnected
 *
 * @param {string} label - label of disconnected task
 * @param {immutable.List} todo - list of tasks to be completed
 * @param {immutable.List} live - list of live tasks
 * @param {immutable.List} done - list of finished tasks
 *
 * @return {Object}
 */
function disconnect(label, todo, live, done) {
    debug(`${label} disconnected.`);
    return { todo, live, done };
}

/**
 * Determine if task ok to run given dependencies
 *
 * @param {Object} task - task to test
 * @param {Array<string>} task.deps - list of dependencies for task
 * @param {immutable.List} done - list of finished tasks
 * @param {string} done[].label - label for finished task
 *
 * @return {bool}
 */
function depsOk(task, done) {
    if (!task.deps || !task.deps.length) {
        return true;
    }

    return task.deps.every(dep => done.findIndex(item => item.label === dep) > -1);
}

/**
 * Given list of tasks todo and live tasks, determine
 * if there are still tasks to be done
 *
 * @param {immutable.List} todo - list of tasks to do
 * @param {immutable.List} live - list of tasks currently running
 *
 * @return {bool}
 */
function workToDo(todo) {
    if (!todo.size) {
        return false;
    }

    return todo.some(item => !item.waiting);
}

/**
 * Determine if there is space to do work given all live
 * tasks.
 *
 * @return {bool}
 */
function spaceForWork(live) {
    return (live.size < (numCore - 1));
}

/**
 * Log in debug mode.
 *
 * @param {string} msg - message to log
 *
 * @return {void}
 */
function debug(msg) {
    process.stdout.write(`${msg}${EOL}`);
}
