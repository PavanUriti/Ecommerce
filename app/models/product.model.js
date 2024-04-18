const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{
    public_id: { type: String },
    url: { type: String },
  }],
  category: { 
    type: String , 
    enum: [
            'Electronics',
            'Cameras',
            'Laptops',
            'Accessories',
            'Headphones',
            'Food',
            "Books",
            'Clothes',
            'Shoes',
            'Beauty/Health',
            'Sports',
            'Outdoor',
            'Home'
    ]
    },
  seller: { type: String },
  stock: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
