const express = require('express');
const productController = require('../controllers/product.controller');
const {sellerOnly, customerOnly} = require('../../common/auth/authorization');

const productRouter = express.Router();
module.exports = productRouter;

productRouter.post('/get', customerOnly, productController.getAllProducts);
productRouter.post('/inventory', sellerOnly, productController.getSellerInventory);
productRouter.post('/', sellerOnly, productController.addProduct);
productRouter.get('/:id?', productController.getProductDetails);
productRouter.put('/:id', productController.isSellerOfProduct, productController.editProduct);
productRouter.delete('/:id', productController.isSellerOfProduct, productController.deleteProduct);