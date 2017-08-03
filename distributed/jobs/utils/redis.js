module.exports = {
    lrem,
    lrange,
    lpush,
    rpush,
    lpop,
    set,
    get
};

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
 * LPUSH redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 * @param {mixed} value - value to push
 *
 * @return {Promise}
 */
function lpush(client, key, value) {
    return new Promise((resolve, reject) => {
        client.lpush(key, value, redisHandler(resolve, reject));
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
 * SET redis command
 *
 * @param {redis.client} client - redis client
 * @param {string} key - redis key
 * @param {mixed} value - value to set
 *
 * @return {Promise}
 */
function set(client, key, value) {
    return new Promise((resolve, reject) => {
        client.get(key, redisHandler(resolve, reject));
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
