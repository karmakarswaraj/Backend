import mongoose from "mongoose";
import connectDB from "./database/indexDb.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  path: ".env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB connection failed: ", err));
