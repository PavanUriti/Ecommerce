'use strict';

require('dotenv').config();

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;
startup().then( ()=> {
    app.listen(PORT, () => {
        console.log(`Server is running on Port: ${PORT}`);
      });
}, (error)=>{
    console.info(`Error Starting the Server on port ${PORT}-${error}`);
});

/**
* app startup logic 
*/
async function startup() {
    await require('./startup/init')(app);
    app.use(await require('./auth/authenticate'));
    await require('./startup/server.routes')(app);
    app.use(require('./middleware/errorhandler')); // Error handling middleware
}

