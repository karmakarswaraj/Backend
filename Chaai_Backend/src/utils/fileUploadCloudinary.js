import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCLoudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded to cloudinary: ", result.url);
    return result;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
};

export { uploadOnCLoudinary };
