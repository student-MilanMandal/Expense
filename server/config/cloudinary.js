import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Uploads a local file or buffer to Cloudinary in the specified folder.
 * @param {Object|String} file - Express Multer file object or file path string
 * @param {String} folder - Cloudinary target folder name (default: 'Expense tracker')
 * @returns {Promise<String>} - Secure URL of uploaded image
 */
export const uploadImageToCloudinary = async (file, folder = 'Expense tracker') => {
  try {
    if (!file) return '';

    const filePath = typeof file === 'string' ? file : file.path;

    if (filePath) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto',
      });
      return result.secure_url;
    }

    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: folder, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    }

    return '';
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`, { cause: error });
  }
};

export default cloudinary;
