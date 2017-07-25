/**
 * This most simple example uses the task scheduler to run
 * five tasks. We provide an array with references to
 * task modules. Tasks may also have dependencies and
 * will be organized accordingly.
 */

const schedule = require('./../scheduler');
const { EOL } = require('os');

const tasks = [
    {
        label: 'task1',
        path: './tasks/task1.js',
        deps: [ 'task3' ]
    },
    {
        label: 'task2',
        path: './tasks/task2.js'
    },
    {
        label: 'task3',
        path: './tasks/task3.js'
    },
    {
        label: 'task4',
        path: './tasks/task4.js'
    },
    {
        label: 'task5',
        path: './tasks/task5.js'
    }
];

schedule(tasks)
    .then(() => {
        process.stdout.write(`DONE!${EOL}`);
        process.exit(0);
    })
    .catch(err => {
        process.stderr.write(err.message);
        process.exit(1);
    });
