const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const {uploadImage} = require('../../shared/helpers/cloudinary');
const orderService = require('../services/order.service');
const {createTempFile, deleteFile} = require('../../shared/utils/file-operations');
const Pagination = require('../../shared/pagination');
const { connectToRabbitMQ, sendToQueue } = require('../../shared/helpers/amqp');
const mongoose = require('mongoose');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

module.exports = {
    placeOrder,
    cancelOrder,
    isOwnerOfOrder,
    markOrderAsDelivered,
    getAllOrders,
    getOrderDetails,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function placeOrder(req, res, next) {
    try {

        const data = {
            ...req.body, user: req.user.userId
        };

        const channel = await connectToRabbitMQ();

        await sendToQueue('order_creation_queue', data);

        return handleResponse(req, res, next, StatusCodes.OK, '', `Order Placed successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while placing Order.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function cancelOrder(req, res, next) {
    try {

        const id = req.params.id;
        await orderService.updateOrderStatus(id, 'Cancelled')

        return handleResponse(req, res, next, StatusCodes.OK, {id}, `Order Cancelled successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while cancelling Order.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function isOwnerOfOrder(req, res, next) {
    try{
        const user=req.user;
        const userId=user.userId;
        const orderId = req.params.id;
    
        if (!orderId) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid input');
        }
        const order= await orderService.getOrderById(orderId);
        if (!order ) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Order does not exist');
        }

        if (order.user.toString() !==  userId) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Not the owner of order');
        }
    
        next();  
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while authorization.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function markOrderAsDelivered(req, res, next) {
    try {

        const id = req.params.id;
        await orderService.updateOrderStatus(id, 'Delivered')

        return handleResponse(req, res, next, StatusCodes.OK, {id}, `Order Delivered successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while updating order as Delivered.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getAllOrders (req, res, next) {
    try {
        const reqBody = req.body;
        const user = new mongoose.Types.ObjectId(req.user.userId);

        const matchQuery = await orderService.getMatchQuery(reqBody.searchTerm, reqBody.filters);
        
        let reqPaginationBody = req.body.pagination;
        if (!reqPaginationBody) {
            reqPaginationBody = {
                pageSize: 10,
                pageIndex: 1,
                sort: {
                    column: 'updatedAt',
                    direction: 'desc',
                },
            };
        }
        
        const pageSize = reqPaginationBody.pageSize;
        const pageIndex = reqPaginationBody.pageIndex;
        const columnName = reqPaginationBody.sort.column;
        const direction = reqPaginationBody.sort.direction;
        const sortParam = {};

        sortParam[columnName] = direction === 'desc' ? -1 : 1;
            
        const result = await orderService.getAllOrders({user}, matchQuery, pageSize, pageIndex, sortParam);
        
        const count = await orderService.getAllOrdersCount({user}, matchQuery);

        const pagination = new Pagination(columnName, direction, count, pageSize, pageIndex);

        return handleResponse(req, res, next, StatusCodes.OK, result, '', '', result.length> 0? pagination :null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while getting Orders.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getOrderDetails(req, res, next) {
    try {
        const id = req.params.id;

        const order = await orderService.getOrderDetails(id);
        if (!order) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Order not found.');
        }

        return handleResponse(req, res, next, StatusCodes.OK, order , `Order details retrieved successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while getting order details.', error.message));
    }
}