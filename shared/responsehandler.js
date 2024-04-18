
const STATUS_TYPE = {
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning',
    PARTIAL_SUCCESS: 'partialSuccess',
};

module.exports = function(req, res, next, statuscode, items={}, message='', description ='', pagination='') {
    const jsonItems = JSON.parse(JSON.stringify(items));

    const response = {};

    if (items != null) {
        if (Array.isArray(jsonItems)) {
            const itemsObject = {
                'items': jsonItems,
                'count': jsonItems.length,
            };
            response['data'] = itemsObject;
        } else {
            const itemObject = {
                'item': jsonItems,
            };
            response['data'] = itemObject;            
        }
    } else {
        response['data'] = {};        
    }

    if (pagination) {
        response['pagination'] =
                          {
                            'total': pagination.total,
                            'sort': {
                                'column': pagination.sortColumn,
                                'direction': pagination.sortDirection,
                            },
                            'pageSize': pagination.pageSize,
                            'pageIndex': pagination.pageIndex,
                          };
        if (pagination.hasMore != null) {
            response.pagination.hasMore = pagination.hasMore;
        }
    }

    response.status = getStatus(statuscode, message);
        
    
    if (description) {
        response.status['description'] = description;
    } 

    res.status(statuscode).send(response);

    next()
};

/**
 * Get status object based on status code
 * @param {Number} statuscode 
 * @param {string} message 
 */
function getStatus(statuscode, message) {
    const status = {};
    switch (statuscode) {
    case 206: 
        status.type = STATUS_TYPE.PARTIAL_SUCCESS;
        break;
    case 299: 
        status.type = STATUS_TYPE.WARNING;
        break;
    case 200:
    case 201:
    case 202:       
    case 203:    
    case 204:    
    case 205:        
        status.type = STATUS_TYPE.SUCCESS;
        break;

    case 301:
    case 302:
    case 303:
    case 304:    
        status.type = STATUS_TYPE.INFO;
        break;


    case 500:
    case 501:
    case 503:
    case 400:
    case 401:
    case 403:
    case 404:
    case 405:
    case 428:
    case 409:
        status.type = STATUS_TYPE.ERROR;
        break;
    }
    status.message=message;

    return status;
}