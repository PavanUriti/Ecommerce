const express = require('express');
const productController = require('../controllers/product.controller');

const productRouter = express.Router();
module.exports = productRouter;

productRouter.post('/get', productController.getAllProducts);
productRouter.post('/', productController.addProduct);
productRouter.get('/:id?', productController.getProductDetails);
productRouter.put('/:id', productController.editProduct);
productRouter.delete('/:id', productController.deleteProduct);