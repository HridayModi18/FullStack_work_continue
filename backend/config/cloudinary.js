const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder on Cloudinary
 * @param {string} [resourceType="auto"] - "image", "video", "raw" (for PDF/ZIP)
 * @returns {Promise<object>} - Cloudinary upload response object
 */
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
