import { Router } from "express";

import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";

import {
  uploadUserFiles,
  uploadAvatar,
  uploadCover,
} from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  loginValidator,
  changePasswordValidator,
  updateAccountValidator,
  usernameParamValidator,
} from "../validators/user.validator.js";

import {
  forgotPasswordLimiter,
  authLimiter,
} from "../middlewares/rateLimiter.middleware.js";

import { validate } from "../validators/validation.middleware.js";

const router = Router();

/**
 * ==========================================
 * Public Routes
 * ==========================================
 */

// Register
router.post(
  "/register",
  authLimiter,
  uploadUserFiles,
  registerValidator,
  validate,
  registerUser
);

// Login
router.post("/login", authLimiter, loginValidator, validate, loginUser);

// Refresh Token
router.post("/refresh-token", authLimiter, refreshAccessToken);

// Forgot Password
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password/:token",
  authLimiter,
  resetPasswordValidator,
  validate,
  resetPassword
);

/**
 * ==========================================
 * Protected Routes
 * ==========================================
 */

router.post("/logout", verifyJWT, logOutUser);

router.post(
  "/change-password",
  verifyJWT,
  changePasswordValidator,
  validate,
  changeCurrentPassword
);

router.get("/current-user", verifyJWT, getCurrentUser);

router.patch(
  "/update-account",
  verifyJWT,
  updateAccountValidator,
  validate,
  updateAccountDetails
);

router.patch("/avatar", verifyJWT, uploadAvatar, updateAvatar);

router.patch("/cover-image", verifyJWT, uploadCover, updateCoverImage);

router.get(
  "/c/:username",
  verifyJWT,
  usernameParamValidator,
  validate,
  getUserChannelProfile
);

router.get("/history", verifyJWT, getWatchHistory);

export default router;
