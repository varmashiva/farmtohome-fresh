import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    marketPrice: {
        type: Number,
        required: true,
        default: 0
    },
    margin: {
        type: Number,
        required: true,
        default: 0
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    stockStatus: {
        type: String,
        enum: ['inStock', 'outOfStock'],
        default: 'inStock',
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
