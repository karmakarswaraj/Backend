import multer from "multer";

// Configure multer storage options
const storage = multer.diskStorage({
  // Set destination folder where files will be stored
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Destination directory
  },
  // Set filename with the original name
  filename: function (req, file, cb) {
    cb(null, file.originalname); // File name format
  },
});

// Export multer instance with configured storage options
export const upload = multer({ storage });
