const express = require('express');
const app = express();
const initApp = require('../../common/startup/init');
const errorHandler = require('../../common/middleware/errorhandler');
const { connectToRabbitMQ, consumeFromQueue } = require('../../common/shared/helpers/amqp');
const {startConsumer} = require('./services/product.service');

require('dotenv').config();

const PORT = process.env.PRODUCT_CONSUMER_PORT || 3010;

startServer();

async function startServer() {
    try {
        await initApp(app);

        await connectToRabbitMQ();

        startConsumer();

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on Port: ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting the server: ${error}`);
        process.exit(1);
    }
}

