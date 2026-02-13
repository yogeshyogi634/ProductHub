import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import { requireManagement } from "../middleware/roleAuth.middleware.js";
import { createReply, deleteReply } from "../controllers/reply.controller.js";

router.post("/", protect, requireManagement, createReply);
router.delete("/:id", protect, deleteReply);

export default router;
