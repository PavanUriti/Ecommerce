const express = require('express');
const app = express();
const initApp = require('./startup/init');
const errorHandler = require('./middleware/errorhandler');
const { connectToRabbitMQ, consumeFromQueue } = require('./shared/helpers/amqp');
const orderService = require('./app/services/order.service');

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

async function startOrderConsumer() {
    try {
        
        consumeFromQueue('order_creation_queue', async function (data) {
            try {
                
                await orderService.placeOrder(data);

                console.log('Order Placed successfully for User:', data.user);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        consumeFromQueue('inventory_check_queue', async function (data) {
            try {
                
                await orderService.performInventoryCheck(data.orderId);

                console.log('Inventory check completed for Order:', data.orderId);
            } catch (error) {
                console.error('Error product Inventory check:', error);
            }
        });

        consumeFromQueue('order_shipping_queue', async function (data) {
            try {
                const { orderId, trackingNumber } = data;

                // Perform shipping process 
                console.log(`Shipping order ${orderId} with tracking number: ${trackingNumber}`);

                await orderService.markOrderAsShipped(orderId);

                // Notify customer about the shipment

                console.log(`Order ${orderId} marked as Shipped with tracking number: ${trackingNumber}`);
            } catch (error) {
                console.error('Error processing shipping:', error);
            }
        });

        console.log('Order Worker Service connected to RabbitMQ. Waiting for messages...');
    } catch (error) {
        console.error('Error starting consumer:', error);
    }
}
