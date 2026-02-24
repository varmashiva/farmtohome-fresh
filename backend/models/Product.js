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
    image: {
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
    isAvailable: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
