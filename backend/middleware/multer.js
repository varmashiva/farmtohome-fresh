import multer from 'multer';

// Use memory storage to process files immediately into buffers before Cloudinary streaming
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit size to 5MB
    }
});

export default upload;
