import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
export const createPaymentOrder = async (req, res) => {
    try {
        // Enforce strict checkout validating the entire cloud cart natively mapping pure Product metrics
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'sizes overallStockStatus name price'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart cannot be natively authenticated. It is empty." });
        }

        let totalCartAmount = 0;

        // Perform rigid stock & pricing extraction iterating active references
        for (const item of cart.items) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({ success: false, message: "Some items are out of stock." });
            }
            if (product.overallStockStatus === 'outOfStock') {
                return res.status(400).json({ success: false, message: "Some items are out of stock." });
            }

            const sizeManifest = product.sizes.find(s => s.size === item.size);

            if (!sizeManifest) {
                return res.status(400).json({ success: false, message: "Some items are out of stock." });
            }
            if (sizeManifest.stockStatus === 'outOfStock') {
                return res.status(400).json({ success: false, message: "Some items are out of stock." });
            }

            // Bind exactly to live variant prices 
            totalCartAmount += sizeManifest.price * item.quantity;
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: totalCartAmount * 100, // strictly use backend calculated total
            currency: "INR",
            receipt: "receipt_order_" + Date.now(),
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json({
            razorpayOrderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // Full order logic from frontend
            userId,
            community,
            address,
            items,
            totalAmount,
            deliveryDate
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log("--- RAZORPAY SIGNATURE DEBUG ---");
        console.log("Received Signature:", razorpay_signature);
        console.log("Expected Signature:", expectedSign);
        console.log("Raw Payload:", sign);
        console.log("Using Secret:", process.env.RAZORPAY_KEY_SECRET ? "Exists (Hidden)" : "MISSING!");

        if (razorpay_signature === expectedSign) {

            // SECURITY: Cross-reference live stock again before finalizing the order structure!
            for (const item of items) {
                const targetId = typeof item.product === 'object' ? item.product._id : (item.product || item.productId || item._id);
                const liveProduct = await Product.findById(targetId);
                if (!liveProduct || liveProduct.overallStockStatus === 'outOfStock') {
                    return res.status(400).json({ success: false, message: `Order rejected. Item ${item.name} became out of stock during payment.` });
                }
                const liveSize = liveProduct.sizes.find(s => s.size === (item.selectedSize || item.size));
                if (!liveSize || liveSize.stockStatus === 'outOfStock') {
                    return res.status(400).json({ success: false, message: `Order rejected. Size ${item.selectedSize || item.size} became out of stock during payment.` });
                }
            }

            // Normalize items again before saving
            const formattedItems = items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                size: item.selectedSize || item.size,
                image: item.imageUrl || item.image || item.images?.[0]?.url,
                product: item.product || item.productId || item._id
            }));

            // Save Order to Database ONLY AFTER VERIFICATION
            const order = new Order({
                user: userId || req.user._id,
                orderItems: formattedItems,
                address,
                community,
                deliveryDate,
                paymentMethod: 'Razorpay',
                totalPrice: totalAmount,
                isPaid: true,
                paidAt: Date.now(),
                paymentResult: {
                    id: razorpay_payment_id,
                    status: 'Paid',
                    update_time: new Date().toISOString(),
                    email_address: req.user.email
                },
                status: 'confirmed'
            });

            try {
                const createdOrder = await order.save();

                // Fire off confirmation emails asynchronously
                const customerEmail = req.user?.email;
                const customerName = req.user?.name || 'Customer';
                const adminEmails = ['Farmtohome@gmail.com', 'farmtohome666@gmail.com', 'shivavarma336@gmail.com', 'vinnugollakoti289@gmail.com', 'charankanuri2003@gmail.com', 'charancherry8180@gmail.com'];

                if (customerEmail) {
                    sendEmail(
                        customerEmail,
                        `Order Confirmed - Farm to Home [${createdOrder._id}]`,
                        `Hi ${customerName},\n\nYour Farm to Home order has been successfully placed and paid for. Your Order ID is ${createdOrder._id}. Total Amount: ₹${createdOrder.totalPrice}.\n\nThank you for choosing Farm to Home!`
                    );
                }

                adminEmails.forEach(adminEmail => {
                    sendEmail(
                        adminEmail,
                        `New Order Received - [${createdOrder._id}]`,
                        `A new order has been placed successfully by ${customerName} (${customerEmail || 'N/A'}).\n\nOrder ID: ${createdOrder._id}\nTotal Amount: ₹${createdOrder.totalPrice}\nCommunity: ${createdOrder.community}\nStatus: ${createdOrder.status}`
                    );
                });

                // Emit socket event for new order
                const io = req.app.get('io');
                if (io) io.emit('orderCreated', createdOrder);

                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully",
                    orderId: createdOrder._id
                });
            } catch (saveError) {
                console.error("Order Save Error:", saveError);
                return res.status(500).json({
                    success: false,
                    message: `Order creation failed: ${saveError.message}`
                });
            }
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("--- PAYMENT HANDLER ERROR ---", error);
        res.status(500).json({ message: error.message });
    }
};
