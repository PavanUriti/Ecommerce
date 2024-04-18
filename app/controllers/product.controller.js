const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const {uploadImage} = require('../../shared/helpers/cloudinary');
const productService = require('../services/product.service');
const {createTempFile, deleteFile} = require('../../shared/utils/file-operations');
const Pagination = require('../../shared/pagination');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

module.exports = {
    addProduct,
    editProduct,
    getAllProducts,
    getProductDetails,
    deleteProduct,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function addProduct(req, res, next) {
    try {
        const { name, price, description, category, seller, stock } = req.body;

        let images = [];
        if (req.files && req.files.attachments) {
            const uploadedFiles = Array.isArray(req.files.attachments)
                ? req.files.attachments
                : [req.files.attachments];

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];

                const tempFilePath = await createTempFile(file.name, file.data);

                const result = await uploadImage(tempFilePath, {
                    folder: 'products'
                });

                images.push({
                    public_id: result.public_id,
                    url: result.url
                });

                await deleteFile(tempFilePath);
            }
        }

        const data = {
            name, price, description, category, seller, stock, images, user: req.user.userId
        };

        const result = await productService.addProduct(data);

        return handleResponse(req, res, next, StatusCodes.OK, { id: result }, `Product added successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during adding product.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function editProduct(req, res, next) {
    try {
        const id = req.params.id;
        const { name, price, description, category, seller, stock } = req.body;

        const product = await productService.getProductById(id);
        if (!product) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Product not found.');
        }

        let images = [];

        if (req.files && req.files.attachments) {
            const uploadedFiles = Array.isArray(req.files.attachments)
                ? req.files.attachments
                : [req.files.attachments];

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];

                const tempFilePath = await createTempFile(file.name, file.data);

                const result = await uploadImage(tempFilePath, {
                    folder: 'products'
                });

                images.push({
                    public_id: result.public_id,
                    url: result.url
                });

                await deleteFile(tempFilePath);
            }
        }

        const setData = {
            name, price, description, category, seller, stock
        };

        const addToSetData = { images }
        const result = await productService.editProduct(id, setData, addToSetData);

        return handleResponse(req, res, next, StatusCodes.OK, { id }, `Product edit successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during editing product.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getAllProducts (req, res, next) {
    try {
        const reqBody = req.body;
        
        const matchQuery = await productService.getMatchQuery(reqBody.searchTerm, reqBody.filters);
        
        let reqPaginationBody = req.body.pagination;
        if (!reqPaginationBody) {
            reqPaginationBody = {
                pageSize: 10,
                pageIndex: 1,
                sort: {
                    column: 'updatedAt',
                    direction: 'desc',
                },
            };
        }
        
        const pageSize = reqPaginationBody.pageSize;
        const pageIndex = reqPaginationBody.pageIndex;
        const columnName = reqPaginationBody.sort.column;
        const direction = reqPaginationBody.sort.direction;
        const sortParam = {};

        sortParam[columnName] = direction === 'desc' ? -1 : 1;
            
        const result = await productService.getAllProducts(matchQuery, pageSize, pageIndex, sortParam);
        
        const count = await productService.getAllProductsCount(matchQuery);

        const pagination = new Pagination(columnName, direction, count, pageSize, pageIndex);

        return handleResponse(req, res, next, StatusCodes.OK, result, '', '', result.length> 0? pagination :null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while getting products.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getProductDetails(req, res, next) {
    try {
        const id = req.params.id;
        const version = req.query.version;

        const product = await productService.getProductDetails(id, version);
        if (!product) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Product not found.');
        }

        return handleResponse(req, res, next, StatusCodes.OK, product , `Product details retrieved successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while getting product details.', error.message));
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function deleteProduct(req, res, next) {
    try {
        const id = req.params.id;
        await productService.deleteProductById(id);
        return handleResponse(req, res, next, StatusCodes.OK, {id} , `Product deleted successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while deleting product details.', error.message));
    }
}