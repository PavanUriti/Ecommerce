const express = require('express');
const userController = require('../controllers/user.controller');

const userRouter = express.Router();
module.exports = userRouter;


userRouter.post('/register', userController.registration);

userRouter.post('/login', userController.login);


