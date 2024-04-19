const Product = require('../../../common/models/product.model');

module.exports = {
    getProductById,
    updateProductInventory,
  };


/**
 * 
 * @param {*} id
 * @returns 
 */
async function getProductById(id) {
    try {
      const result = await Product.findById(id).lean();
      return result;
    } catch (error) {
      throw new Error(`Error getting details from database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} setData 
 * @returns 
 */
async function updateProductInventory(id, setData) {
    try {
      const result = await Product.findByIdAndUpdate(id, { $inc: { version: 1, ...setData }});
      return result;
    } catch (error) {
      throw new Error(`Error updating details to database: ${error.message}`);
    }
}