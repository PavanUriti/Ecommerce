const handleResponse = require('../shared/responsehandler');
const ClientError = require('../shared/client-error');
const ServerError = require('../shared/server-error');

module.exports = function handleError( err, req, res, next) {
    if (err instanceof ClientError || err instanceof ServerError) {
        console.log(err);
        return handleResponse(req, res, next, err.status || 500, {}, err.message, err.description);
    }
}