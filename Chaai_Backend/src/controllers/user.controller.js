import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCLoudinary } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
