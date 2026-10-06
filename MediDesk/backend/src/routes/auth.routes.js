const express = require("express");
const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authRateLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authenticate, getMe);

module.exports = router;