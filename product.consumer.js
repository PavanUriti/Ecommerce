const express = require('express');
const app = express();
const initApp = require('./startup/init');
const errorHandler = require('./middleware/errorhandler');
const { connectToRabbitMQ, consumeFromQueue } = require('./shared/helpers/amqp');
const productService = require('./app/services/product.service');

require('dotenv').config();

const PORT = process.env.PRODUCT_PORT || 3010;

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

async function startConsumer() {
    try {
        
        consumeFromQueue('product_creation_queue', async function (data) {
            try {
                
                await productService.createProduct(data);

                console.log('Product created successfully:', data.name);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        consumeFromQueue('product_edit_queue', async function (data) {
            try {
                
                await productService.updateProduct(data);

                console.log('Product updated successfully:', data.id);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        console.log('Worker Service connected to RabbitMQ. Waiting for messages...');
    } catch (error) {
        console.error('Error starting consumer:', error);
    }
}
