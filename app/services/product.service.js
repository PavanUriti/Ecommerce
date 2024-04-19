const Product = require('../models/product.model');
const moment = require('moment');
const {validateFQL, getMQL} = require('../../shared/fqlparser');
const queryFilter = require('../../shared/utils/query-builder');
const ClientError = require('../../shared/client-error');
const {StatusCodes} = require('http-status-codes');
const {uploadImage} = require('../../shared/helpers/cloudinary');
const {createTempFile, deleteFile} = require('../../shared/utils/file-operations');

module.exports = {
    addProduct,
    createProduct,
    getProductById,
    editProduct,
    updateProduct,
    getMatchQuery,
    getAllProducts,
    getAllProductsCount,
    deleteProductById,
    getProductDetails,
    updateProductInventory,
  };

/**
 * 
 * @param {*} data
 * @returns 
 */
async function addProduct(data) {
    try {
      const result = await Product.create(data);
      return result._id;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function createProduct(data) {
    try {

        const imagesPromises = data.images.map(async imagePath => {
            const { public_id, url } = await uploadImage(imagePath, { folder: 'products' });
            return { public_id, url };
        });

        const images = await Promise.all(imagesPromises);
        data.images = images;
        await addProduct(data)
    
    } catch (error) {
      throw new Error(`Error consuming data: ${error.message}`);
    }
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function updateProduct(data) {
    try {

        const imagesPromises = data.addToSetData.images.map(async imagePath => {
            const { public_id, url } = await uploadImage(imagePath, { folder: 'products' });
            return { public_id, url };
        });

        const images = await Promise.all(imagesPromises);
        data.addToSetData.images = images;
        await editProduct(data.id, data.setData, data.addToSetData)
    
    } catch (error) {
      throw new Error(`Error consuming data: ${error.message}`);
    }
}

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
 * @param {*} version 
 * @returns 
 */
async function getProductDetails(id, version) {
    try {
      const result = await Product.findOne({_id: id, version}).lean();
      return result;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} id
 * @returns 
 */
async function deleteProductById(id) {
    try {
      const result = await Product.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} id 
 * @param {*} setData 
 * @param {*} addToSetData 
 * @returns 
 */
async function editProduct(id, setData, addToSetData) {
    try {
      const result = await Product.findByIdAndUpdate(id, { $set: setData, $push: addToSetData, $inc: { version: 1 }}, {new: true, upsert: true });
      return result;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
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

/**
 * 
 * @param {*} searchTerm
 * @param {*} filters 
 * @return {*} Match Query
 */
async function getMatchQuery( searchTerm, filters=[]) {
    const filterArray = [];
    let object;
    if (!validateFQL(filters)) {
        throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid Filter Query');
    }

    for (let i = 0; i < filters.length; i++) {
        object = filters[i];
        const itemType = typeof (filters[i]);
        if (itemType == 'object') {
            switch (object.key) {
            case 'category':
            case  'seller':
                object = await queryFilter.getRegExQuery(object);
                break;
            }
        }
        filterArray.push(object);
    }
    const matchQuery = getMQL(filterArray);

    if (searchTerm) {
        const escapedSearchTerm = queryFilter.escapeSplChars(searchTerm);
        const searchTermRegex = new RegExp(escapedSearchTerm, 'i');
        matchQuery['$expr'] = {'$regexMatch': {'input': '$name', 'regex': searchTermRegex}};
    }
    return matchQuery;
};

/**
 * 
 * @param {*} matchQuery 
 * @param {*} pageSize 
 * @param {*} pageIndex 
 * @param {*} sortParam 
 */
async function getAllProducts(matchQuery, pageSize, pageIndex, sortParam) {
    const skipRecords = (pageSize * pageIndex) - pageSize;

    const result = await Product.aggregate([
        {$match: matchQuery},
        {$sort: sortParam},
        {$skip: skipRecords},
        {$limit: pageSize},
        {$project: {
            '_id': 0,
            'id': '$_id',
            'name': '$name',
            'price': '$price',
            'category': '$category',
            'seller'  : '$seller',
            'version': '$version',
            'thumbnail' : {$cond: {if: {$gt: [{$size: '$images'}, 0]}, then: {$arrayElemAt: ['$images.url', 0]}, else: '-'}} 
        }},
    ]).allowDiskUse(true);
    
    return result;
};

/**
 * 
 * @param {*} matchQuery 
 */
async function getAllProductsCount( matchQuery) {
    return await Product.countDocuments(matchQuery);
};