const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getFeedback,
  createFeedback,
  deleteFeedback,
} = require("../controllers/feedback.controller");

router.get("/", protect, getFeedback);
router.post("/", protect, createFeedback);
router.delete("/:id", protect, deleteFeedback);

module.exports = router;
