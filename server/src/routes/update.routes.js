import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import { requireManagement } from "../middleware/roleAuth.middleware.js";
import {
  getUpdates,
  getUpdateById,
  createUpdate,
  editUpdate,
  changeStatus,
  getStatusHistory,
  deleteUpdate,
  getStatuses,
} from "../controllers/update.controller.js";

router.get("/statuses", protect, getStatuses);
router.get("/", protect, getUpdates);
router.get("/:id", protect, getUpdateById);
router.get("/:id/history", protect, getStatusHistory);
router.post("/", protect, requireManagement, createUpdate);
router.put("/:id", protect, editUpdate);
router.patch("/:id/status", protect, changeStatus);
router.delete("/:id", protect, deleteUpdate);

export default router;
