const express = require('express');
const productController = require('../controllers/product.controller');
const {sellerOnly} = require('../../common/auth/authorization');

const productRouter = express.Router();
module.exports = productRouter;

productRouter.post('/get', productController.getAllProducts);
productRouter.post('/', sellerOnly, productController.addProduct);
productRouter.get('/:id?', productController.getProductDetails);
productRouter.put('/:id', productController.isSellerOfProduct, productController.editProduct);
productRouter.delete('/:id', productController.isSellerOfProduct, productController.deleteProduct);