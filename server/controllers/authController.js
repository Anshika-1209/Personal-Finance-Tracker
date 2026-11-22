const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      currency,
      monthlyIncome,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (
      monthlyIncome !== undefined &&
      (!Number.isFinite(Number(monthlyIncome)) ||
        Number(monthlyIncome) < 0)
    ) {
      return res.status(400).json({
        message: "Monthly income must be a valid non-negative number.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      currency: currency || "INR",
      monthlyIncome:
        monthlyIncome === undefined ? 0 : Number(monthlyIncome),
    });

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to register user.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Read directly from MongoDB to support legacy password fields.
    const user = await User.collection.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Support both old and new password field names.
    const storedPasswordHash =
      user.passwordHash || user.password;

    if (!storedPasswordHash) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      storedPasswordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Automatically migrate old accounts.
    if (!user.passwordHash && user.password) {
      await User.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash: user.password,
          },
          $unset: {
            password: "",
          },
        }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful! 💚",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency || "INR",
        monthlyIncome: user.monthlyIncome || 0,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to login.",
    });
  }
};

module.exports = { registerUser, loginUser };