import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
  getFeedback,
  createFeedback,
  deleteFeedback,
} from "../controllers/feedback.controller.js";

router.get("/", protect, getFeedback);
router.post("/", protect, createFeedback);
router.delete("/:id", protect, deleteFeedback);

export default router;
