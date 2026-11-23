
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

    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
  },
  { timestamps: true }
);

// Prevent duplicate budgets for the same category in the same month.
budgetSchema.index(
  { category: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model('Budget', budgetSchema);