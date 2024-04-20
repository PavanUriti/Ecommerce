const redis = require('redis');
const config = require('../config/default.json');

exports.init = init;

let client;

/**
 * 
 */
async function init() {  
    const options = ({
        host: 'redis',
        port: 6379,
      });
    client = await redis.createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

    return client;
};

