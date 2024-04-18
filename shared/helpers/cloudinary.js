const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 
 * @param {*} file 
 * @param {*} options 
 * @returns 
 */
async function uploadImage(file, options) {
    return new Promise((resolve, reject) => {
        if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
        }

        cloudinary.uploader.upload(file, options, (error, result) => {
            if (error) {
                console.error('Error uploading file to Cloudinary:', error);
                reject(new Error('Failed to upload file to Cloudinary'));
            } else {
                resolve({ public_id: result.public_id, url: result.secure_url });
            }
        });
    });
}

module.exports = { uploadImage };
