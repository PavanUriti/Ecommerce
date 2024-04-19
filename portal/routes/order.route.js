const express = require('express');
const orderController = require('../controllers/order.controller');
const {customerOnly, sellerOnly} = require('../../common/auth/authorization');

const orderRouter = express.Router();
module.exports = orderRouter;

orderRouter.post('/get', customerOnly, orderController.getAllOrders);
orderRouter.post('/', customerOnly, orderController.placeOrder);
orderRouter.get('/:id?', customerOnly, orderController.isOwnerOfOrder, orderController.getOrderDetails);
orderRouter.delete('/:id', customerOnly, orderController.isOwnerOfOrder, orderController.cancelOrder);
orderRouter.put('/:id', sellerOnly, orderController.markOrderAsDelivered);