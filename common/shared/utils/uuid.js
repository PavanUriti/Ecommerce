const {v4: uuidv4} = require('uuid');

// Function to generate a random UUID
function generateRandomUUID() {
    return uuidv4();
}

module.exports ={
    generateRandomUUID,
}; 
