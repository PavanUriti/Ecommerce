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
    getOrderById,
    performInventoryCheck,
    updateOrderStatus,
    markOrderAsShipped,
    getMatchQuery,
    getAllOrders,
    getAllOrdersCount,
    getOrderDetails,
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

/**
 * 
 * @param {*} searchTerm
 * @param {*} filters 
 * @return {*} Match Query
 */
async function getMatchQuery( searchTerm, filters=[]) {
    const filterArray = [];
    let object;
    if (!validateFQL(filters)) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid Filter Query');
    }

    for (let i = 0; i < filters.length; i++) {
        object = filters[i];
        const itemType = typeof (filters[i]);
        if (itemType == 'object') {
            switch (object.key) {
            case 'status':
                object = await getStatusQuery(object);
                break;
            }
        }
        filterArray.push(object);
    }
    const matchQuery = getMQL(filterArray);

    if (searchTerm) {
        const escapedSearchTerm = queryFilter.escapeSplChars(searchTerm);
        const searchTermRegex = new RegExp(escapedSearchTerm, 'i');
        matchQuery['$expr'] = {'$regexMatch': {'input': '$products.name', 'regex': searchTermRegex}};
    }
    return matchQuery;
};

/**
 * 
 * @param {*} filterObject 
 */
async function getStatusQuery(filterObject) {
    await isValidCondition(filterObject);

    let statusQuery;
    let values;

    if (typeof filterObject.value == 'string') {
        values = [filterObject.value];
    } else {
        values = filterObject.value.slice();
    }

    if (filterObject.condition.toLowerCase() == 'equal') {
        statusQuery = {'status': {'$in': values}};
    } else {
        statusQuery = {'status': {'$nin': values}};
    }
 
    return statusQuery;
};

/**
 * 
 * @param {*} filterObject 
 */
async function isValidCondition(filterObject) {
    if (filterObject.condition.toLowerCase() !== 'equal' && filterObject.condition.toLowerCase() !== 'not equal') {
        throw new ClientError(400, 'Invalid Condition');
    }
}

/**
 * 
 * @param {*} matchQuery 
 * @param {*} pageSize 
 * @param {*} pageIndex 
 * @param {*} sortParam 
 */
async function getAllOrders(idQuery, matchQuery, pageSize, pageIndex, sortParam) {
    const skipRecords = (pageSize * pageIndex) - pageSize;

    const result = await Order.aggregate([
        {$match: idQuery},
        {$unwind: {
            path: '$products',
            preserveNullAndEmptyArrays: false,
        }},
        {$match: matchQuery},
        {$sort: sortParam},
        {$skip: skipRecords},
        {$limit: pageSize},
        {$project: {
            '_id': 0,
            'id': '$_id',
            'productId':'$products.product',
            'name': '$products.name',
            'thumbnail' : '$products.url',
            'status': '$status',
        }},
    ]).allowDiskUse(true);
    
    return result.length>0?result:[];
};

/**
 * 
 * @param {*} matchQuery 
 */
async function getAllOrdersCount(idQuery, matchQuery) {
    const result = await Order.aggregate([
        {$match: idQuery},
        {$unwind: {
            path: '$products',
            preserveNullAndEmptyArrays: false,
        }},
        {$match: matchQuery},
        {$group: {'_id': null, 'count': {$sum: 1}}},
    ]).allowDiskUse(true);
    
    return result.length>0?result[0].count:0;
};

/**
 * 
 * @param {*} id 
 * @returns 
 */
async function getOrderDetails(id) {
    try {
      const result = await Order.findById(id).lean();
      return result;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}