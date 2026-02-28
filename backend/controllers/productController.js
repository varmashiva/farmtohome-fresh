import Product from '../models/Product.js';

// Helper to compute overallStockStatus dynamically
const computeOverallStockStatus = (product) => {
    if (!product.sizes || product.sizes.length === 0) return 'outOfStock';
    return product.sizes.some(size => size.stockStatus === 'inStock') ? 'inStock' : 'outOfStock';
};

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        // Append dynamically computed overallStockStatus
        const formattedProducts = products.map(product => {
            const p = product.toObject();
            p.overallStockStatus = computeOverallStockStatus(p);
            return p;
        });
        res.json(formattedProducts);
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
            const p = product.toObject();
            p.overallStockStatus = computeOverallStockStatus(p);
            res.json(p);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update specific size
// @route   PUT /api/products/:id/size
export const updateProductSize = async (req, res) => {
    const { size, price, stockStatus, description } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const sizeItem = product.sizes.find(s => s.size === size);
            if (sizeItem) {
                if (price !== undefined) sizeItem.price = price;
                if (stockStatus !== undefined) sizeItem.stockStatus = stockStatus;
                if (description !== undefined) sizeItem.description = description;

                const updatedProduct = await product.save();
                const p = updatedProduct.toObject();
                p.overallStockStatus = computeOverallStockStatus(p);

                // Emit unified socket event for real-time update
                const io = req.app.get('io');
                if (io) {
                    io.emit('sizeStockUpdated', {
                        productId: p._id.toString(),
                        size: size.toString(),
                        price: sizeItem.price,
                        stockStatus: sizeItem.stockStatus ? sizeItem.stockStatus.toString() : 'inStock',
                        description: sizeItem.description,
                        overallStockStatus: p.overallStockStatus ? p.overallStockStatus.toString() : 'inStock'
                    });
                }

                res.json(p);
            } else {
                res.status(404).json({ message: 'Size not found in product' });
            }
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
        const { name, images, marketPrice, margin, sizes } = req.body;

        const product = new Product({
            name: name || 'Sample name',
            images: images || [],
            marketPrice: marketPrice || 0,
            margin: margin || 0,
            sizes: sizes || [
                { size: 'Small', price: 0, stockStatus: 'inStock', description: 'Small size' },
                { size: 'Medium', price: 0, stockStatus: 'inStock', description: 'Medium size' },
                { size: 'Large', price: 0, stockStatus: 'inStock', description: 'Large size' }
            ]
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
    const { name, images, marketPrice, margin, sizes } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            if (images) product.images = images;

            if (marketPrice !== undefined) product.marketPrice = marketPrice;
            if (margin !== undefined) product.margin = margin;
            if (sizes) product.sizes = sizes;

            const updatedProduct = await product.save();

            const io = req.app.get('io');
            if (io) {
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

import cloudinary from '../config/cloudinary.js';

// @desc    Add new images to existing product
// @route   PUT /api/products/:id/add-images
export const addProductImage = async (req, res) => {
    const { newImages } = req.body; // Expect array: [{ url, publicId }]

    try {
        const product = await Product.findById(req.params.id);
        if (product && newImages && newImages.length > 0) {
            if (!product.images) {
                product.images = [];
            }
            product.images.push(...newImages);
            const updatedProduct = await product.save();

            const io = req.app.get('io');
            if (io) {
                io.emit('productUpdated', updatedProduct);
            }
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found or invalid images payload' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove an image from a product
// @route   DELETE /api/products/:id/remove-image
export const removeProductImage = async (req, res) => {
    const { publicId } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            // Delete from cloudinary
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Failed to delete image from Cloudinary:', cloudinaryError);
                    // Continue dropping it from the database anyway to avoid ghost artifacts
                }
            }

            // Pull image from Mongo array
            if (product.images) {
                product.images = product.images.filter((img) => img.publicId !== publicId);
            } else {
                product.images = [];
            }
            const updatedProduct = await product.save();

            const io = req.app.get('io');
            if (io) {
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
