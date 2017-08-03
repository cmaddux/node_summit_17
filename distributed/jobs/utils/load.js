const fs = require('fs');
const path = require('path');

module.exports = {
    labelFromTaskPath,
    getTaskDirList,
    getTaskPaths
};

/**
 * Derive a task label from the path to the task file
 *
 * @param {string} taskPath - path to task file
 *
 * @return {string}
 */
function labelFromTaskPath(taskPath) {
    const file = taskPath.slice(taskPath.lastIndexOf(path.sep) + 1);
    return file.replace('.js', '');
}

/**
 * Retrieve list of everyhting in the tasks directory.
 *
 * @return {Promise}
 */
function getTaskDirList() {
    return new Promise((resolve, reject) => {
        fs.readdir('./tasks', (err, list) => {
            if (err) {
                return reject(err);
            }

            resolve(list);
        });

    });

}

/**
 * Given a path, determine if is a file and resolve with null if not.
 *
 * @param {string} pathToTest - path to determine if is directory
 *
 * @return {Promise}
 */
function nullIfNotFile(pathToTest) {
    return new Promise((resolve, reject) => {
        fs.stat(pathToTest, (err, stat) => {
            if (!stat || err) {
                return reject(err);
            }

            if (stat.isDirectory()) {

                // If not a file, return null
                return resolve(null);
            }

            // Otherwise, return path
            resolve(pathToTest);
        });

    });

}

/**
 * Map over everything in task dir and return paths of task
 * files.
 *
 * @param {Array<string>} taskDirList - list of everything in tasks directory
 *
 * @return {Promise}
 */
function getTaskPaths(taskDirList) {
    const promises = taskDirList.map(file => {
        const pathToTest = path.resolve('./tasks', file);
        return nullIfNotFile(pathToTest);
    });

    return Promise.all(promises)
        .then(list => list.filter(item => item));
}
