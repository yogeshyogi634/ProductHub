const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getUpdates,
  getUpdateById,
  createUpdate,
  editUpdate,
  deleteUpdate,
} = require("../controllers/update.controller");

router.get("/", protect, getUpdates);
router.get("/:id", protect, getUpdateById);
router.post("/", protect, createUpdate);
router.put("/:id", protect, editUpdate);
router.delete("/:id", protect, deleteUpdate);

module.exports = router;
