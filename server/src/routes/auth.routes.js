const express = require("express");
const {
  register,
  login,
  logout,
  me,
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth");
const authLimiter = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;