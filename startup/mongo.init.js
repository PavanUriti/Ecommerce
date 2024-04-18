const config = require('../config/default.json');
const mongoose = require('mongoose');

const DATABASE = process.env.DB_DATABASE;

const baseConnectionString = config.mongobaseUrlString;
const options = { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

module.exports = async function() {
    let radarConnection = baseConnectionString;
    radarConnection =radarConnection.replace('{tenantName}', DATABASE);
    try {
        await mongoose.connect(radarConnection, options);
        console.info('Connected to MongoDB');
    } catch (ex) {
        console.info('Failed to Connect to MongoDB');
        console.info('Process will exit gracefully');
        console.info(ex);
        process.exit(0);
    }
};
