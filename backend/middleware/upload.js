const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/images");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware to handle file upload with express-fileupload
const uploadFile = (req, res, next) => {
    // Check if file exists in request
    if (!req.files || !req.files.image) {
        return next(); // No file to upload, continue
    }

    const image = req.files.image;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(image.mimetype)) {
        return res.status(400).json({
            success: false,
            message: 'Only JPEG, PNG, and JPG images are allowed'
        });
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
        return res.status(413).json({
            success: false,
            message: 'Image size should be less than 5MB'
        });
    }

    // Generate unique filename
    const fileName = `complaint_${Date.now()}_${image.name}`;
    const uploadPath = path.join(__dirname, '../uploads/images', fileName);

    // Move file to upload directory
    image.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload image'
            });
        }
        // Attach file info to request
        req.filePath = `/uploads/images/${fileName}`;
        next();
    });
};

module.exports = uploadFile;