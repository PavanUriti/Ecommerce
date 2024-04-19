const express = require('express');
const app = express();
const initApp = require('../../common/startup/init');
const errorHandler = require('../../common/middleware/errorhandler');
const { connectToRabbitMQ } = require('../../common/shared/helpers/amqp');
const {startOrderConsumer} = require('./services/order.service');

require('dotenv').config();

const PORT = process.env.ORDER_CONSUMER_PORT || 3020;

startServer();

async function startServer() {
    try {
        await initApp(app);

        await connectToRabbitMQ();

        startOrderConsumer();

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on Port: ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting the server: ${error}`);
        process.exit(1);
    }
}

