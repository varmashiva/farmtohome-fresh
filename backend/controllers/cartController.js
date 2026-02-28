import Cart from '../models/Cart.js';

// @desc    Get logged-in user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'overallStockStatus sizes'
        });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
            return res.json(cart);
        }

        // Hydrate strict live stock metrics derived from matching Products
        const cartData = cart.toObject();
        cartData.items = cartData.items.map(item => {
            const productNode = item.product;
            let stockStatus = 'outOfStock';
            let overallStockStatus = 'outOfStock';

            if (productNode) {
                overallStockStatus = productNode.overallStockStatus;
                const sizeMatch = productNode.sizes?.find(s => s.size === item.size);
                if (sizeMatch) {
                    stockStatus = sizeMatch.stockStatus;
                }
            }

            return {
                ...item,
                product: productNode?._id || item.product,
                stockStatus,
                overallStockStatus
            };
        });

        res.json(cartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { product, name, image, size, price, quantity } = req.body;

        // Find cart or create
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Check if item exists (by product ID and size)
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === product && item.size === size
        );

        if (itemIndex > -1) {
            // Item exists, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // New item, push
            cart.items.push({ product, name, image, size, price, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { product, size, quantity } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === product && item.size === size
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                // If 0, remove it
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeCartItem = async (req, res) => {
    try {
        const { product, size } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => !(item.product.toString() === product && item.size === size)
        );

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart after order
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
