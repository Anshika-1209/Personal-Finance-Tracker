const mongoose = require('mongoose');

const recurringRuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly'] },
    nextRunDate: { type: Date, required: true, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringRule', recurringRuleSchema);