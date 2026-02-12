const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { createReply, deleteReply } = require("../controllers/reply.controller");

router.post("/", protect, createReply);
router.delete("/:id", protect, deleteReply);

module.exports = router;
