import cloudinary from '../config/cloudinary.js';

// @desc    Upload multiple product images to Cloudinary
// @route   POST /api/upload/product-images
// @access  Private/Admin
const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No image files provided' });
        }

        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'fresh-prawns/products',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload stream error:', error);
                            reject(error);
                        } else {
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id
                            });
                        }
                    }
                );

                stream.end(file.buffer);
            });
        });

        const uploadedImages = await Promise.all(uploadPromises);

        res.json({
            message: 'Images successfully uploaded',
            images: uploadedImages
        });
    } catch (error) {
        console.error('Upload handler error:', error);
        res.status(500).json({ message: 'Error handling multiple image upload' });
    }
};

export { uploadProductImages };
