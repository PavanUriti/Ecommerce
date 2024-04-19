const Product = require('../../common/models/product.model');
const {uploadImage} = require('../../common/shared/helpers/cloudinary');
const { consumeFromQueue } = require('../../common/shared/helpers/amqp');

module.exports = {
  startConsumer,
  };

async function startConsumer() {
    try {
        
        consumeFromQueue('product_creation_queue', async function (data) {
            try {
                
                await createProduct(data);

                console.log('Product created successfully:', data.name);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        consumeFromQueue('product_edit_queue', async function (data) {
            try {
                
                await updateProduct(data);

                console.log('Product updated successfully:', data.id);
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        console.log('Worker Service connected to RabbitMQ. Waiting for messages...');
    } catch (error) {
        console.error('Error starting consumer:', error);
    }
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function addProduct(data) {
    try {
      const result = await Product.create(data);
      return result._id;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function createProduct(data) {
    try {

        const imagesPromises = data.images.map(async imagePath => {
            const { public_id, url } = await uploadImage(imagePath, { folder: 'products' });
            return { public_id, url };
        });

        const images = await Promise.all(imagesPromises);
        data.images = images;
        await addProduct(data)
    
    } catch (error) {
      throw new Error(`Error consuming data: ${error.message}`);
    }
}

/**
 * 
 * @param {*} data
 * @returns 
 */
async function updateProduct(data) {
    try {

        const imagesPromises = data.addToSetData.images.map(async imagePath => {
            const { public_id, url } = await uploadImage(imagePath, { folder: 'products' });
            return { public_id, url };
        });

        const images = await Promise.all(imagesPromises);
        data.addToSetData.images = images;
        await editProduct(data.id, data.setData, data.addToSetData)
    
    } catch (error) {
      throw new Error(`Error consuming data: ${error.message}`);
    }
}


/**
 * 
 * @param {*} id 
 * @param {*} setData 
 * @param {*} addToSetData 
 * @returns 
 */
async function editProduct(id, setData, addToSetData) {
    try {
      const result = await Product.findByIdAndUpdate(id, { $set: setData, $push: addToSetData, $inc: { version: 1 }}, {new: true, upsert: true });
      return result;
    } catch (error) {
      throw new Error(`Error adding details to database: ${error.message}`);
    }
}
