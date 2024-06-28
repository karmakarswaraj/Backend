import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

// Configure Cloudinary with API credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
const uploadOnCLoudinary = async (filePath) => {
  try {
    if (!filePath) return null; // Check if filePath is provided
    // Upload file to Cloudinary with auto-detected resource type
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded to Cloudinary: ", result.url); // Log Cloudinary URL of uploaded file
    return result; // Return Cloudinary upload result object
  } catch (error) {
    fs.unlinkSync(filePath); // Delete file from local storage on error
    throw error; // Re-throw error for handling upstream
  }
};

export { uploadOnCLoudinary };
