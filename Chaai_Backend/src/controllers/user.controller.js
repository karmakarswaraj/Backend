import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCLoudinary } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
  sameSite: "Strict",
};
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If user is not found, throw an error
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate access and refresh tokens using instance methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user's document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //details input from user
  const { username, email, fullname, password } = req.body;

  //validation of input
  if (!fullname || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  //check if user exists
  const exists = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exists) {
    throw new ApiError(400, "User already exists");
  }

  //upload to cloudinary(images)
  console.log("Files received:", req.files);
  const avatarFile = req.files?.avatar?.[0].path;
  const coverImageFile = req.files?.coverImage?.[0].path;

  if (!avatarFile) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to Cloudinary (images)
  const avatar = await uploadOnCLoudinary(avatarFile);
  const coverImage = coverImageFile
    ? await uploadOnCLoudinary(coverImageFile)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  //create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  //remove password n token from response
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "User not created");
  }
  //send response
  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //Get data
  const { email, username, password } = req.body;

  //validate by username/email
  if (!(email || username)) {
    throw new ApiError(400, "Invalid entries of username or email");
  }

  //find the user
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  //check password
  const isValidPassword = await user.isPasswordValid(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid password");
  }
  //Token generation
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loginUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );
  //send cookies
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, loginUser, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  // Clear cookies
  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, null, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorised request: Token is missing");
  }

  const decodedToken = jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(401, "Unauthorised request: Invalid token");
  }
  const user = User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Unauthorised request: User not found");
  }

  if(user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Unauthorised request: Invalid token");
  }

  const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

  res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, null, "Access token refreshed successfully"))

});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
