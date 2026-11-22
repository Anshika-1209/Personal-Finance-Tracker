const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/", authMiddleware, getProfile);

// Update logged-in user's profile
router.put("/", authMiddleware, updateProfile);

module.exports = router;