const Joi = require('joi');
const nameRegex =require('../../shared/regular-expression').NAME;
const phoneRegex =require('../../shared/regular-expression').PHONE;

module.exports = {
    validateRegistration,
    validateLoginUser,
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateRegistration(user) {
    const schema = Joi.object({
        userName: Joi.string().trim().min(5).max(10).required(),
        firstName: Joi.string().regex(nameRegex).max(30).required(),
        lastName: Joi.string().regex(nameRegex).max(30).required(),
        password: Joi.string().min(8).max(15).required(),
        email: Joi.string().email().max(50).required(),
        phone: Joi.string().regex(phoneRegex).allow(''),
        role: Joi.string().valid('admin', 'customer').default('customer'),
    });

    return schema.validate(user);
}

/**
 * 
 * @param {*} user
 * @return {*} validation result
 */
function validateLoginUser(user) {
    const schema = Joi.object({
        email: Joi.string().email().max(50).required(),
        password: Joi.string().min(8).max(15).required(),
    });

    return schema.validate(user);
}
