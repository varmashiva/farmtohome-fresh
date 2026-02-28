import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
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
    sizes: [
        {
            size: {
                type: String,
                enum: ['Small', 'Medium', 'Large'],
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            stockStatus: {
                type: String,
                enum: ['inStock', 'outOfStock'],
                default: 'inStock'
            },
            description: {
                type: String,
                default: ''
            }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
