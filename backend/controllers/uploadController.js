import cloudinary from '../config/cloudinary.js';

// @desc    Upload product image to Cloudinary
// @route   POST /api/upload/product-image
// @access  Private/Admin
const uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'fresh-prawns/products',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload stream error:', error);
                    return res.status(500).json({ message: 'Error uploading image to Cloudinary via stream' });
                }
                res.json({
                    message: 'Image securely uploaded via stream',
                    imageUrl: result.secure_url
                });
            }
        );

        stream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload handler error:', error);
        res.status(500).json({ message: 'Error handling upload request' });
    }
};

export { uploadProductImage };
