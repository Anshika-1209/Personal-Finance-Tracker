

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
      default: '#7c5cff',
    },
  },
  { timestamps: true }
);

// Prevent duplicate budget entries for the same category.
budgetSchema.index({ category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
