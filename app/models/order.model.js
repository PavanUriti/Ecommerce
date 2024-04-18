const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shippingSchema = new Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
},{'_id': false});

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    products: [
        {
            name: {type: String, required: true},
            product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    shippingInfo: { type: shippingSchema, required: true },
    paymentInfo: {
        paymentMode: {type: String, enum: ['Paid Online', 'COD'], default: 'COD'},
        status: {type: String, enum: ['Pending', 'Successful'], default: 'Pending'}
    },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

