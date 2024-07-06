import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCLoudinary } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteFileFromCloudinary } from "../utils/fileDeleteCloudinary.js";

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
  // Extract the token from either cookies or body
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  // Check if the token is missing
  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized request: Token is missing");
  }

  try {
    // Verify the incoming token
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user associated with the token
    const user = await User.findById(decodedToken._id);

    // Check if the user exists
    if (!user) {
      throw new ApiError(401, "Unauthorized request: User not found");
    }

    // Check if the refresh token matches the one stored in the user's document
    if (user.refreshToken !== incomingToken) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Set cookies and send the response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, null, "Access token refreshed successfully"));
  } catch (error) {
    // Handle verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }
    // Handle other errors
    throw new ApiError(500, "Something went wrong while refreshing the token");
  }
});

const currentPasswordChange = asyncHandler(async (req, res) => {
  // Get the old and new passwords from the request body
  const { oldPassword, newPassword } = req.body;

  // Check if the old and new passwords are provided
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  // Find the user by ID
  const user = await User.findById(req.user._id);

  // Check if the user is found
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the old password is valid
  const isValidPassword = await user.isPasswordValid(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  // Set the new password (hashing will be done in the model's pre-save hook)
  user.password = newPassword;
  await user.save();

  // Send the response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  //Get user
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  //Get user data
  const { email, fullname } = req.body;
  //check validation
  if (!email || !fullname) {
    throw new ApiError(400, "Enter the field to change");
  }
  //get user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullname, email }, //get the changes
    },
    { new: true }
  ).select("-password");
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Changed successfully updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCLoudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Avatar file is not uploaded");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Store the current cover image public ID for deletion later
  const previousAvatar = user.avatar;

  // Update the user document with the new cover image URL
  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  //Delete prev image from cloudinary
  if (previousAvatar) {
    await deleteFileFromCloudinary(previousAvatar);
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Changed successfully updated"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing");
  }
  const coverImage = await uploadOnCLoudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "CoverImage file is not uploaded");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Store the current cover image public ID for deletion later
  const previousCoverImage = user.coverImage;

  // Update the user document with the new cover image URL
  user.coverImage = coverImage.url;
  await user.save({ validateBeforeSave: false });

  //Delete prev image from cloudinary
  if (previousCoverImage) {
    await deleteFileFromCloudinary(previousCoverImage);
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Changed successfully updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriptions",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        totalSubscribers: {
          $size: "$subscriptions",
        },
        totalSubscriptions: {
          $size: "$subscribed",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribed.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        totalSubscribers: 1,
        totalSubscriptions: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Successfully got the user profile")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  currentPasswordChange,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
