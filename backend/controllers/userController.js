import User from '../models/User.js';

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getUserCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json(user.cartItems || []);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update (Sync) user cart
// @route   PUT /api/users/cart
// @access  Private
const syncUserCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.cartItems = req.body.cartItems || [];
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUserCart, syncUserCart };
