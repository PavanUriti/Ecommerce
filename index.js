'use strict';

require('dotenv').config();

const express = require('express');
const authenticate = require('./auth/authenticate');
const initApp = require('./startup/init');
const setupRoutes = require('./startup/server.routes');
const errorHandler = require('./middleware/errorhandler');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initApp(app);
        app.use(await authenticate);
        await setupRoutes(app);
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on Port: ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting the server on port ${PORT}: ${error}`);
    }
}

startServer();
