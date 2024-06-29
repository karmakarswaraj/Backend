import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //Checks the token before the logout
    const token =
      req.cookies?.accessToken ||
      req.headers?.("authorization").replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Invalid token");
    }
    //decode the token to get user info for logout process
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //finds the user to be used by the logout process
    const user = await User.findById(
      decodedToken?._id.select("-password -refreshToken")
    );

    if (!user) {
      throw new ApiError(401, "Invalid user");
    }

    //send the user for the logout process
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "You are not logged in");
  }
});