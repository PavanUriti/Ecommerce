const ClientError = require('../shared/client-error');

module.exports = {
    adminOnly,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function adminOnly(req, res, next) {
    if (req.user.role == 'customer') {
        next( new ClientError(400, 'Customer not allowed'));
    } else if (req.user.role == 'admin') {
        next();  
    } 
}