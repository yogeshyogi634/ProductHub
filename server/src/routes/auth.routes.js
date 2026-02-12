const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  googleLogin,
  getMe,
  logout,
  devLogin,
} = require("../controllers/auth.controller");

// Public routes
router.post("/google", googleLogin);
router.post("/dev-login", devLogin); // DEV ONLY — remove in production

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
