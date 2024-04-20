const Joi = require('joi');
const joiSchemas = require('../../common/shared/utils/joi-validator');

const filterKeys = ['status'];

module.exports = {
    createOrder,
    validateGetAll,
}

const shippingSchema = Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
});

const productSchema = Joi.object({
    name: Joi.string().required(),
    product: Joi.string().required(), 
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    url: Joi.string().allow('')
});


const paymentSchema = Joi.object({
    paymentMode: Joi.string().valid('Paid Online', 'COD').required(),
    status: Joi.string().valid('Pending', 'Successful').required()
});

const orderSchema = Joi.object({
    products: Joi.array().items(productSchema).min(1).required(),
    totalPrice: Joi.number().min(0).required(),
    shippingInfo: shippingSchema.required(),
    paymentInfo: paymentSchema
});


/**
 *
 * @param {*} data schema
 * @return {validationResult} validationResult
 */
function createOrder(data) {

    return orderSchema.validate(data);
}


/**
 * 
 * @param {*} requestBody 
 * @return {*} validation result.
 */
function validateGetAll(requestBody) {
    const { filters, searchTerm, pagination } = joiSchemas.getAllSchema(filterKeys);

    const schema = Joi.object({
        filters,
        searchTerm,
        pagination,
    });

    return schema.validate(requestBody);
}