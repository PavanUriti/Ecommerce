const Joi = require('joi');

const validConditions = ['equal', 'not equal', 'endswith', 'contains', 'startswith'];
const validOperators = ['and', 'or', '(', ')'];

exports.getFQLSchema = getFQLSchema;
exports.getFilterSchema = getFilterSchema;
exports.getAllSchema = getAllSchema;

/**
 * 
 * @param {*} keys 
 * @return {*}
 */
function getFQLSchema(keys) {
    return Joi.array().items(Joi.object().keys({
        key: Joi.string().insensitive().required().valid(...Object.values(keys)),
        value: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string().required())).required(),
        condition: Joi.string().insensitive().required().valid(...Object.values(validConditions)),
    }),
    Joi.string().insensitive().optional().valid(...Object.values(validOperators)));
};

/**
 * 
 * @param {*} keys 
 * @return {*}
 */
function getFilterSchema(keys) {
    return Joi.object().keys({
        key: Joi.string().insensitive().required().valid(...Object.values(keys)),
        value: Joi.string().required().allow(''),
        condition: Joi.string().insensitive().required(),
        pageIndex: Joi.number().integer().min(1),
        pageSize: Joi.number().integer().min(1),
    });  
};

/**
 * 
 * @param {*} keys 
 * @return {*}
 */
function getAllSchema(keys) {
    return {
        filters: getFQLSchema(keys),
        searchTerm: Joi.string().insensitive().required().allow(''),
        pagination: Joi.object().keys({
            pageSize: Joi.number().integer().min(1).max(1000).required(),
            pageIndex: Joi.number().integer().min(1).required(),
            sort: {
                column: Joi.string().required(),
                direction: Joi.string().valid('asc', 'desc').required(),
            },         
        }).optional(),
    };
};
