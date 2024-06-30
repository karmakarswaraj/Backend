import { v2 as cloudinary } from 'cloudinary';

// Function to delete a file from Cloudinary using its URL
const deleteFileFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error('File URL is missing');
    }

    // Extract the public ID from the file URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.substring(0, fileName.lastIndexOf('.'));

    // Delete the file from Cloudinary using the public ID
    const result = await cloudinary.uploader.destroy(publicId);

    // Check the result of the deletion
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete file: ${result.result}`);
    }

    console.log('File successfully deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error(`Error deleting file from Cloudinary: ${error.message}`);
  }
};

export { deleteFileFromCloudinary };
