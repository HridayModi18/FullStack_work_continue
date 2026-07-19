const multer = require("multer");

// Keep file buffers in memory for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300mb limits
  },
});

module.exports = upload;
