const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getProducts } = require("../controllers/product.controller");

router.get("/", protect, getProducts);

module.exports = router;
