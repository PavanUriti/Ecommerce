const {StatusCodes} = require('http-status-codes');

const INTERNAL_SERVER_ERROR_500 = '500 Internal Server Error';
const CONTACT_ADMINSTRATOR = 'Please contact System Administrator..!';

/**
 * 
 */
class ServerError extends Error {    
    /**
     * 
     * @param {*} status 
     * @param {*} message 
     * @param {*} description
     */
    constructor(status = StatusCodes.INTERNAL_SERVER_ERROR, message = INTERNAL_SERVER_ERROR_500,  
        description = CONTACT_ADMINSTRATOR) {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}

module.exports = ServerError;
