import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
  googleLogin,
  getMe,
  logout,
  getAllUsers,
  devLogin,
} from "../controllers/auth.controller.js";
import {
  requestOTP,
  verifyOTP,
  resendOTP,
  getDepartments,
} from "../controllers/otpAuth.controller.js";

// Public routes
router.get("/departments", getDepartments); // Get available departments
router.post("/request-otp", requestOTP); // Request OTP for login
router.post("/verify-otp", verifyOTP); // Verify OTP and login
router.post("/resend-otp", resendOTP); // Resend OTP

// Legacy routes (can be removed later)
router.post("/google", googleLogin);
router.post("/dev-login", devLogin); // DEV ONLY — remove in production

// Protected routes
router.get("/me", protect, getMe);
router.get("/users", protect, getAllUsers);
router.post("/logout", protect, logout);

export default router;
