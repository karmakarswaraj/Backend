import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // console.log(req.cookies)  
  try {
    // Retrieve the token from cookies or authorization header
    const tokenFromCookies = req.cookies?.accessToken;
    // const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");

    // Log token sources for debugging
    console.log("Token from cookies:", tokenFromCookies);
    // console.log("Token from header:", tokenFromHeader);

    const token = tokenFromCookies;

    // Check if the token is present and is a string
    if (!token || typeof token !== 'string') {
      throw new ApiError(401, "Unauthorized request: Token is missing or invalid");
    }

    // Decode the token to get user info
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    // Find the user and exclude password and refreshToken fields
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    // Check if the user exists
    if (!user) {
      throw new ApiError(401, "Unauthorized request: User not found");
    }

    // Attach the user to the request object for use in the next middleware
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    next(new ApiError(401, error.message || "Unauthorized request: Invalid access token"));
  }
});
