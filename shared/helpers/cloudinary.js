const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


async function uploadImage(file, options) {
    try {
        const result = await cloudinary.uploader.upload(file, options);
  
        return { public_id: result.public_id, url: result.secure_url };
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error('Failed to upload file to Cloudinary');
    }
}

module.exports = { uploadImage };
