const ClientError = require('../shared/client-error');
const {StatusCodes} = require('http-status-codes');

module.exports = {
    sellerOnly,
    customerOnly,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function sellerOnly(req, res, next) {
    if (req.user.role == 'customer') {
        next( new ClientError(StatusCodes.BAD_REQUEST, 'Customer not allowed to acccess this resource'));
    } else if (req.user.role == 'seller') {
        next();  
    } 
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function customerOnly(req, res, next) {
    if (req.user.role == 'seller') {
        next( new ClientError(StatusCodes.BAD_REQUEST, 'Seller not allowed to acccess this resource'));
    } else if (req.user.role == 'customer') {
        next();  
    } 
}