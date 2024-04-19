const Order = require('../../common/models/order.model');
const productService = require('./product.service');
const { sendToQueue, consumeFromQueue } = require('../../common/shared/helpers/amqp');
const {generateRandomUUID} = require('../../common/shared/utils/uuid');

module.exports = {
    startOrderConsumer
}

async function startOrderConsumer() {
    try {
        
        consumeFromQueue('order_creation_queue', async function (data) {
            try {
                
                await placeOrder(data);

                console.log('Order Placed successfully for User:', data.user);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        consumeFromQueue('inventory_check_queue', async function (data) {
            try {
                
                await performInventoryCheck(data.orderId);

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

                await markOrderAsShipped(orderId);

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

/**
 * 
 * @param {*} id
 * @returns 
 */
async function getOrderById(id) {
    try {
      const result = await Order.findById(id).lean();
      return result;
    } catch (error) {
      throw new Error(`Error getting details from database: ${error.message}`);
    }
}

async function performInventoryCheck(orderId) {
    try {
        const order = await Order.findById(orderId).populate(['products', 'shippingInfo', 'paymentInfo']);
        const products = order.products;

        for (const product of products) {
            const inventoryItem = await productService.getProductById(product.product);
            if (!inventoryItem) {
                throw new Error(`Inventory not found for product: ${product.product}`);
            }

            if (inventoryItem.stock < product.quantity) {
                console.log(`Insufficient inventory for product: ${product.product}`);
                await updateOrderStatus(orderId, 'Cancelled');
                return;
            } else {
                console.log(`Sufficient inventory for product: ${product.product}`);
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
        await updateOrderStatus(orderId, 'Cancelled');
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


