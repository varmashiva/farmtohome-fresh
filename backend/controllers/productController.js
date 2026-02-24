import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product price (marketPrice & margin -> sellingPrice)
// @route   PUT /api/products/update-price/:id
export const updateProductPrice = async (req, res) => {
    const { marketPrice, margin } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.marketPrice = marketPrice !== undefined ? marketPrice : product.marketPrice;
            product.margin = margin !== undefined ? margin : product.margin;
            product.sellingPrice = product.marketPrice + product.margin;

            const updatedProduct = await product.save();

            // Emit socket event for real-time update
            const io = req.app.get('io');
            io.emit('priceUpdated', {
                productId: updatedProduct._id,
                newPrice: updatedProduct.sellingPrice,
                marketPrice: updatedProduct.marketPrice,
                margin: updatedProduct.margin
            });

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
