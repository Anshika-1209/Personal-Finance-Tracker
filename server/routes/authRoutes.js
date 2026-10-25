
const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/verify", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authentication successful! 💚",
    userId: req.userId,
  });
});

module.exports = router;


