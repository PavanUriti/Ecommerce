// 'use strict';

const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const sanitizer= require('../shared/utils/xss-sanitizer');
const requestLogger = require('../middleware/reqlogger');
const fileUpload = require('express-fileupload');

module.exports = init;

/**
 * 
 * @param {*} app 
 */
async function init(app) {
    process.on('uncaughtException', (ex) => {
        console.error(ex, '');
    } );

    process.on('unhandledRejection', (ex) => {
        console.log(ex, '');
    });
    await require('./mongo.init')();
    app.use(requestLogger);
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json({limit: '100mb'}));
    app.use(bodyParser.json({type: 'application/*+json'}));
    app.use(fileUpload({debug: false}));
    app.use(function(req, res, next) {
        sanitizer.sanitize(req.body);
        next();
    });
};
