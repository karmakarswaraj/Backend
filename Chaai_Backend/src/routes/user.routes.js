import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

//Add new User
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
//Login
router.route("/login").post(loginUser);
//Logout
router.route("/logout").post(verifyJWT, logoutUser);
//RefreshToken
router.route("/refresh_token").post(refreshAccessToken);
//Current Password Change
router.route("/change_password").post(verifyJWT, currentPasswordChange);
//Get Current User
router.route("/current_user").get(verifyJWT, getCurrentUser);
//Update Account Details
router.route("/account_details").post(verifyJWT, updateAccountDetails);
//Update User Avatar
router
  .route("/account_details/avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
//Update User Cover Image
router
  .route("/account_details/coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

//Get User Channel Profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
//Get User Watch History
router.route("/watch_history").get(verifyJWT, getWatchHistory);

export default router; 
