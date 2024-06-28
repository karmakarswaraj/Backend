import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose with the provided URL and database name
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    // Log a success message upon successful connection
    console.log(`MONGODB connected....
    Hosted at ${connectionInstance.connection.host}`);
  } catch (error) {
    // Log an error message if connection fails and exit the process
    console.log("MONGODB failed to connect", error);
    process.exit(1);
  }
};

export default connectDB;
