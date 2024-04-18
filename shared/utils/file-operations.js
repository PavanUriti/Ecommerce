const fs = require('fs');
const path = require('path');
const {generateRandomUUID} = require('./uuid');

const tempDir = '/tmp/attachments';

async function createTempFile(fileName, fileData) {

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, {recursive: true});
    }

    const fileExtension = path.extname(fileName).toLowerCase();
    const tempFilePath = `${tempDir}/${generateRandomUUID()}.${fileExtension}`;
    await fs.promises.writeFile(tempFilePath, fileData);

    return tempFilePath;
}

/**
 * 
 * @param {*} filePath 
 */
async function deleteFile(filePath) {
    fs.unlinkSync(filePath);
}

module.exports ={
    createTempFile,
    deleteFile,
}; 