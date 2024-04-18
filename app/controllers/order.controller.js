const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const {uploadImage} = require('../../shared/helpers/cloudinary');
const orderService = require('../services/order.service');
const {createTempFile, deleteFile} = require('../../shared/utils/file-operations');
const Pagination = require('../../shared/pagination');
const { connectToRabbitMQ, sendToQueue } = require('../../shared/helpers/amqp');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

module.exports = {
    placeOrder,
    cancelOrder,
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