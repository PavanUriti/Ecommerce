const redis = require('redis');
const config = require('../config/default.json');

exports.init = init;

let client;

/**
 * 
 */
async function init() {  
    const options = {
        url: config.redisUrl,
    };
    client = await redis.createClient(options)
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

    return client;
};

