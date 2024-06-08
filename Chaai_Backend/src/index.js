import mongoose from "mongoose";
import connectDB from "./database/indexDb.js";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
connectDB();
