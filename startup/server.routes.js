const express = require('express');
const path = require('path');

const userRouter = require('../app/routes/user.route');
const productRouter = require('../app/routes/product.route');
const orderRouter = require('../app/routes/order.route');

/**
 * All the routes will go here
 * @param {app} app
 * @return {void}
 */
module.exports = async function (app) {

  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/product', productRouter);
  app.use('/api/v1/order', orderRouter);

  // Add this middleware to ignore favicon requests
  app.use('/favicon.ico', (req, res) => res.status(204));

};
