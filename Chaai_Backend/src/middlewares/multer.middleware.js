import multer from "multer";

// Configure multer storage options
const storage = multer.diskStorage({
  // Set destination folder where files will be stored
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Destination directory
  },
  // Set filename with a unique suffix to avoid overwriting files
  filename: function (req, file, cb) {
    // Generate a unique filename based on current timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix); // File name format
  },
});

// Export multer instance with configured storage options
export const upload = multer({ storage });
