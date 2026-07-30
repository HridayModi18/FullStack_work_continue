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

/**
 * Deletes a file from Cloudinary using its secure_url
 * Extracts the public_id from the URL and calls cloudinary.uploader.destroy
 * Only deletes if the URL is a valid Cloudinary URL
 * @param {string} secureUrl - The full Cloudinary secure_url of the file to delete
 * @param {string} [resourceType="image"] - "image", "video", "raw"
 * @returns {Promise<object|null>} - Cloudinary deletion result or null if skipped
 */
const deleteFromCloudinary = async (secureUrl, resourceType = "image") => {
  if (!secureUrl || !secureUrl.includes("res.cloudinary.com")) return null;

  try {
    // Extract public_id from URL:
    // e.g. https://res.cloudinary.com/demo/image/upload/v12345/profile_pictures/abc123.jpg
    // public_id = profile_pictures/abc123
    const urlParts = secureUrl.split("/upload/");
    if (urlParts.length < 2) return null;

    let publicIdWithExtension = urlParts[1];
    // Remove version prefix like "v12345/" if present
    publicIdWithExtension = publicIdWithExtension.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (err) {
    console.error("Error deleting from Cloudinary:", err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
