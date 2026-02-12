import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
  googleLogin,
  getMe,
  logout,
  devLogin,
} from "../controllers/auth.controller.js";

// Public routes
router.post("/google", googleLogin);
router.post("/dev-login", devLogin); // DEV ONLY — remove in production

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
