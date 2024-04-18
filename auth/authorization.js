const ClientError = require('../shared/client-error');

module.exports = {
    sellerOnly,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function sellerOnly(req, res, next) {
    if (req.user.role == 'customer') {
        next( new ClientError(400, 'Customer not allowed'));
    } else if (req.user.role == 'seller') {
        next();  
    } 
}