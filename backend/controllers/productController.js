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
// @route   PUT /api/products/:id/update-price
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

// @desc    Create a product
// @route   POST /api/products
export const createProduct = async (req, res) => {
    try {
        const { name, imageUrl, description, marketPrice, margin, stockStatus } = req.body;

        const product = new Product({
            name: name || 'Sample name',
            imageUrl: imageUrl || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Safe fallback
            description: description || 'Sample description',
            marketPrice: marketPrice || 0,
            margin: margin || 0,
            sellingPrice: (marketPrice || 0) + (margin || 0),
            stockStatus: stockStatus || 'inStock'
        });

        const createdProduct = await product.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('productCreated', createdProduct);
        }

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    const { name, imageUrl, description, marketPrice, margin, stockStatus } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.imageUrl = imageUrl || product.imageUrl;
            product.description = description || product.description;

            if (marketPrice !== undefined) product.marketPrice = marketPrice;
            if (margin !== undefined) product.margin = margin;
            product.sellingPrice = product.marketPrice + product.margin;

            if (stockStatus) product.stockStatus = stockStatus;

            const updatedProduct = await product.save();

            const io = req.app.get('io');
            if (io) {
                // Emit targeted price update
                if (marketPrice !== undefined || margin !== undefined) {
                    io.emit('priceUpdated', {
                        productId: updatedProduct._id,
                        newPrice: updatedProduct.sellingPrice,
                        marketPrice: updatedProduct.marketPrice,
                        margin: updatedProduct.margin
                    });
                }

                // Emit raw product data structural update
                io.emit('productUpdated', updatedProduct);
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });

            const io = req.app.get('io');
            if (io) {
                io.emit('productDeleted', product._id);
            }

            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark product Out of Stock / In Stock
// @route   PUT /api/products/:id/out-of-stock
export const updateStockStatus = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Toggle or explicitly set if provided in body. 
            // Defaulting toggle behavior for an isolated button
            product.stockStatus = product.stockStatus === 'inStock' ? 'outOfStock' : 'inStock';
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
