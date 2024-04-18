const express = require('express');
const orderController = require('../controllers/order.controller');
const {customerOnly} = require('../../auth/authorization');

const orderRouter = express.Router();
module.exports = orderRouter;

// orderRouter.post('/get', customerOnly, orderController.getAllOrders);
orderRouter.post('/', customerOnly, orderController.placeOrder);
orderRouter.delete('/:id', customerOnly, orderController.cancelOrder);