import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            size: { type: String, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    address: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        alternatePhone: { type: String, required: false },
        house: { type: String, required: true },
    },
    community: {
        type: String,
        required: true,
        enum: ['Community 1', 'Community 2']
    },
    deliveryDate: {
        type: String, // '24 hours' or specific ISODate string
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'Razorpay',
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
