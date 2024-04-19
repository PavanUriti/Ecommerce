const amqp = require('amqplib/callback_api');
const config = require('../../config/default.json');

const baseConnectionString = config.amqpUrlString;

let connection;
let channel;

async function connectToRabbitMQ() {
    return new Promise((resolve, reject) => {
        if (connection && channel) {
            resolve(channel);
        } else {
            amqp.connect(baseConnectionString, function (error0, conn) {
                if (error0) {
                    reject(error0);
                    return;
                }
                connection = conn;
                connection.createChannel(function (error1, ch) {
                    if (error1) {
                        reject(error1);
                        return;
                    }
                    channel = ch;
                    resolve(channel);
                });
            });
        }
    });
}

async function sendToQueue(queueName, message) {
    try {
        const ch = await connectToRabbitMQ();
        ch.assertQueue(queueName, { durable: true });
        ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    } catch (error) {
        throw new Error(`Error sending message to queue: ${error.message}`);
    }
}

function consumeFromQueue(queueName, callback) {
    const ch = channel;

    if (!ch) {
        throw new Error('Channel is not initialized. Call connectToRabbitMQ first.');
    }

    ch.assertQueue(queueName, { durable: true });
    ch.consume(queueName, function (msg) {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            callback(data);
            ch.ack(msg);
        }
    });
}

module.exports = { connectToRabbitMQ, sendToQueue, consumeFromQueue };
