const Order = require('../models/order.model');
const productService = require('../services/product.service');
const moment = require('moment');
const {validateFQL, getMQL} = require('../../shared/fqlparser');
const queryFilter = require('../../shared/utils/query-builder');
const ClientError = require('../../shared/client-error');
const {StatusCodes} = require('http-status-codes');
const { connectToRabbitMQ, sendToQueue } = require('../../shared/helpers/amqp');
const {generateRandomUUID} = require('../../shared/utils/uuid');

module.exports = {
    placeOrder,
    performInventoryCheck,
    updateOrderStatus,
    markOrderAsShipped,
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function placeOrder(data) {
    try {

        const result = await Order.create(data);
    
        const inventoryCheckData = { orderId: result._id };
        await sendToQueue('inventory_check_queue', inventoryCheckData);

        console.log('Order placed successfully and added to inventory check queue:', result._id.toString());
    } catch (error) {
        throw new Error('Failed to place order', error);
    }
}

async function performInventoryCheck(orderId) {
    try {
        const order = await Order.findById(orderId).populate(['products', 'shippingInfo', 'paymentInfo']);
        const products = order.products;

        for (const product of products) {
            const inventoryItem = await productService.getProductById(product.product);
            if (!inventoryItem) {
                throw new Error(`Inventory not found for product: ${product.name}`);
            }

            if (inventoryItem.stock < product.quantity) {
                console.log(`Insufficient inventory for product: ${product.name}`);
                await updateOrderStatus(orderId, 'Cancelled');
                return;
            } else {
                console.log(`Sufficient inventory for product: ${product.name}`);
            }
        }

        const updatePromises = products.map(async product => {
            const result = await productService.updateProductInventory(product.product,  { stock: -product.quantity })
            return result;
        });

       await Promise.all(updatePromises);

       await updateOrderStatus(orderId, 'Confirmed');

       const trackingNumber = generateRandomUUID();
       const message = { orderId, trackingNumber, shippingInfo: order.shippingInfo, paymentInfo: order.paymentInfo};
       await sendToQueue('order_shipping_queue', message);
       console.log(`Shipping initiated for product with trackingNumber: ${trackingNumber}`);

        return true; 
    } catch (error) {
        throw new Error('Failed to perform inventory check', error);
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} status 
 */
async function updateOrderStatus(id, status) {
    try {
        await Order.findByIdAndUpdate(id, { $set: {status: status}});
    } catch (error) {
        throw new Error('Failed to update status', error);
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} status 
 */
async function markOrderAsShipped(id) {
    try {
        await updateOrderStatus(id, 'Shipped');
    } catch (error) {
        throw new Error('Failed to update status', error);
    }
}