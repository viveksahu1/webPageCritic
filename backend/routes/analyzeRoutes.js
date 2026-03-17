const express = require("express");
const { analyze } = require("../controllers/analyzeController");
const { protect } = require("../middleware/auth");
const { analyzeLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", protect, analyzeLimiter, analyze);

module.exports = router;
