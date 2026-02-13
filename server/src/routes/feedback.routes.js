import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
  getFeedback,
  createFeedback,
  deleteFeedback,
  getCurrentUser,
  getFeedbackCalendar,
  getFeedbackDateRange,
} from "../controllers/feedback.controller.js";

router.get("/me", protect, getCurrentUser);
router.get("/calendar", protect, getFeedbackCalendar);
router.get("/date-range", protect, getFeedbackDateRange);
router.get("/", protect, getFeedback);
router.post("/", protect, createFeedback);
router.delete("/:id", protect, deleteFeedback);

export default router;
