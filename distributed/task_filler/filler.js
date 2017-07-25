/**
 * A simple task filler to get our redis todo queue
 * filled up and ready.
 */

const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

const { EOL } = require('os');

client.on('error', err => {
    process.stderr.write(`${err.message}${EOL}`);
    process.exit(1);
});

client.on('connect', run);

function run() {
    const tasks = [
        'task1',
        'task2',
        'task3',
        'task4',
        'task5'
    ];

    const p = tasks.reduce((p, task) => {
        return p.then(() => lpush(client, task));
    }, Promise.resolve());

    p.then(() => set(client, 'ready', true))
        .then(exit)
        .catch(erred);
}

function set(client, key, value) {
    return new Promise((resolve, reject) => {
        client.set(key, value, redisHandler(resolve, reject));
    });

}

function lpush(client, key, value) {
    return new Promise((resolve, reject) => {
        client.lpush(key, value, redisHandler(resolve, reject));
    });

}

function exit() {
    process.exit(0);
}

function erred(err) {
    process.stderr.write(`${err.message}${EOL}`);
    process.exit(1);
}

function redisHandler(resolve, reject) {
    return (err, res) => {
        if (err) {
            return reject(err);
        }

        resolve(res);
    };

}
