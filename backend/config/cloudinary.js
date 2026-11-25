const cloudinary = require('cloudinary').v2;

/**
 * Check if valid Cloudinary credentials are provided via environment variables.
 * Evaluates dynamically from process.env so runtime/test changes are respected.
 */
const isCloudinaryConfigured = () => {
  const name = (process.env.CLOUDINARY_NAME || '').trim();
  const key = (process.env.CLOUDINARY_API_KEY || '').trim();
  const secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  const isPlaceholder = (val) =>
    !val || val.includes('YOUR_') || val.includes('USE_NEW_');

  return !isPlaceholder(name) && !isPlaceholder(key) && !isPlaceholder(secret);
};

const syncCloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
};

syncCloudinaryConfig();

/**
 * Upload buffer to Cloudinary using stream
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options (folder, resource_type, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary credentials are not properly configured in environment variables.'));
    }

    syncCloudinaryConfig();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'rksd_college',
        resource_type: options.resource_type || 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Safely delete an asset from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - 'image' | 'raw' | 'video'
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) {
    return { result: 'skipped_not_configured' };
  }
  try {
    syncCloudinaryConfig();
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`Error deleting Cloudinary asset ${publicId}:`, err.message);
    return { error: err.message };
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadStreamToCloudinary,
  deleteFromCloudinary
};
