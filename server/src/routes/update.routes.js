import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
  getUpdates,
  getUpdateById,
  createUpdate,
  editUpdate,
  deleteUpdate,
} from "../controllers/update.controller.js";

router.get("/", protect, getUpdates);
router.get("/:id", protect, getUpdateById);
router.post("/", protect, createUpdate);
router.put("/:id", protect, editUpdate);
router.delete("/:id", protect, deleteUpdate);

export default router;
