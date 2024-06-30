import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    avatar: {
      type: String, //Cloudinary URL
      required: true,
    },
    coverImage: {
      type: String, ////Cloudinary URL
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Before saving a user document, execute this middleware function
userSchema.pre("save", async function (next) {
  // Check if the password field has not been modified
  if (!this.isModified("password")) return next();

  // If the password has been modified, hash the password
  // bcrypt.hash(password, saltRounds) hashes the password with 10 salt rounds
  this.password = await bcrypt.hash(this.password, 10);

  // Proceed to the next middleware function
  next();
});

// Define a method to compare a given password with the hashed password stored in the database
userSchema.methods.isPasswordValid = async function (password) {
  // Compare the plaintext password with the hashed password using bcrypt
  return await bcrypt.compare(password, this.password);
};

// Define a method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  // Sign a new JWT containing the user's ID, email, username, and fullname
  // Use the ACCESS_TOKEN_SECRET and set the token's expiration time using ACCESS_TOKEN_EXPIRY
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  // Sign a new JWT containing only the user's ID
  // Use the REFRESH_TOKEN_SECRET and set the token's expiration time using REFRESH_TOKEN_EXPIRY
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);