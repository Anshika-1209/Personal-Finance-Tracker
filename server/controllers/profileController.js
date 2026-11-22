const User = require("../models/User");

// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email currency monthlyIncome createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully!",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch profile.",
    });
  }
};

// Update logged-in user's profile
const updateProfile = async (req, res) => {
  try {
    const { name, currency, monthlyIncome } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      updates.name = name.trim();
    }

    if (currency !== undefined) {
      if (typeof currency !== "string" || !currency.trim()) {
        return res.status(400).json({
          message: "Please provide a valid currency.",
        });
      }

      updates.currency = currency.trim();
    }

    if (monthlyIncome !== undefined) {
      if (
        monthlyIncome === "" ||
        !Number.isFinite(Number(monthlyIncome)) ||
        Number(monthlyIncome) < 0
      ) {
        return res.status(400).json({
          message: "Monthly income must be a valid non-negative number.",
        });
      }

      updates.monthlyIncome = Number(monthlyIncome);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Please provide at least one field to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("name email currency monthlyIncome updatedAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully! 💚",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      message: "Unable to update profile.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};