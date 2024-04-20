const Joi = require('joi');
const joiSchemas = require('../../common/shared/utils/joi-validator');

const filterKeys = ['category', 'seller'];

module.exports = {
    createProduct,
    updateProduct,
    validateGetAll,
}

/**
 *
 * @param {*} data schema
 * @return {validationResult} validationResult
 */
function createProduct(data) {

const productValidationSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  category: Joi.string().valid(
    'Electronics', 'Cameras', 'Laptops', 'Accessories', 'Headphones',
    'Food', 'Books', 'Clothes', 'Shoes', 'Beauty/Health', 'Sports',
    'Outdoor', 'Home'
  ).required(),
  seller: Joi.string().required(),
  stock: Joi.number().required(),
});
    return productValidationSchema.validate(data);
}

function updateProduct(data) {

    const productValidationSchema = Joi.object({
      name: Joi.string().optional(),
      price: Joi.number().optional(),
      description: Joi.string().optional(),
      category: Joi.string().valid(
        'Electronics', 'Cameras', 'Laptops', 'Accessories', 'Headphones',
        'Food', 'Books', 'Clothes', 'Shoes', 'Beauty/Health', 'Sports',
        'Outdoor', 'Home'
      ).optional(),
      seller: Joi.string().optional(),
      stock: Joi.number().optional(),
      version: Joi.number().required(),
    });
        return productValidationSchema.validate(data);
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