import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    const { orderItems, address, community, deliveryDate, paymentMethod, totalPrice, isPaid, paymentResult } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            orderItems,
            user: req.user._id,
            address,
            community,
            deliveryDate,
            paymentMethod,
            totalPrice,
            isPaid: isPaid || false,
            paymentResult: paymentResult || {},
            paidAt: isPaid ? Date.now() : undefined
        });

        const createdOrder = await order.save();

        // Emit socket event for new order
        const io = req.app.get('io');
        io.emit('orderCreated', createdOrder);

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getOrders = async (req, res) => {
    try {
        const filter = req.query.community ? { community: req.query.community } : {};
        const orders = await Order.find(filter).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();

            // Emit socket event for real-time status update
            const io = req.app.get('io');
            if (io) {
                io.emit('orderStatusUpdated', {
                    orderId: updatedOrder._id,
                    status: updatedOrder.status
                });

                if (updatedOrder.status === 'cancelled') {
                    io.emit('orderCancelled', {
                        orderId: updatedOrder._id,
                        totalAmount: updatedOrder.totalPrice,
                        community: updatedOrder.community
                    });
                }
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order explicitly
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = 'cancelled';
            const updatedOrder = await order.save();

            const io = req.app.get('io');
            if (io) {
                io.emit('orderStatusUpdated', {
                    orderId: updatedOrder._id,
                    status: updatedOrder.status
                });
                io.emit('orderCancelled', {
                    orderId: updatedOrder._id,
                    totalAmount: updatedOrder.totalPrice,
                    community: updatedOrder.community
                });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
