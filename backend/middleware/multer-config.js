//Imports
const multer = require('multer');

// MIME types map which resolve files extensions
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Create a storage constant to be passed to multer as configuration
const storage = multer.diskStorage({
    // Indicates to multer where to save files
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // Indicates to multer how to name files
    filename: (req, file, callback) => {
        // Keep original name and replace spaces with underscores
        const name = file.originalname.split(' ').join('_');
        // Use MIME types map to resolve the appropriate file extension
        const extension = MIME_TYPES[file.mimetype];
        // Add timestamp in the file name
        callback(null, name + Date.now() + '.' + extension);
    }
});

// Export multer configuration
module.exports = multer({ storage: storage }).single('image');