const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { castVote, removeVote } = require("../controllers/vote.controller");

router.post("/", protect, castVote);
router.delete("/:updateId", protect, removeVote);

module.exports = router;
