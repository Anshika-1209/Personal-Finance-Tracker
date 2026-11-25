const mongoose = require("mongoose");

const recurringRuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, required: true, enum: ["income", "expense"] },
    frequency: { type: String, required: true, enum: ["daily", "weekly", "monthly"] },
    nextRunDate: { type: Date, required: true, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecurringRule", recurringRuleSchema);

const cron = require("node-cron");
const RecurringRule = require("./models/RecurringRule");
const Transaction = require("./models/Transaction");
const Budget = require("./models/Budget");
const { sendBudgetAlertEmail } = require("./mailer");

async function runRecurringTransactions() {
  const now = new Date();
  const dueRules = await RecurringRule.find({ active: true, nextRunDate: { $lte: now } });

  for (const rule of dueRules) {
    await Transaction.create({
      title: rule.title,
      category: rule.category,
      amount: rule.amount,
      type: rule.type,
      date: now,
    });

    const next = new Date(now);
    if (rule.frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (rule.frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);

    rule.nextRunDate = next;
    await rule.save();
  }
}

async function checkBudgetAlerts() {
  const budgets = await Budget.find().lean();
  for (const budget of budgets) {
    const totals = await Transaction.aggregate([
      { $match: { type: "expense", category: budget.category } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
    ]);
    const spent = totals[0]?.totalSpent || 0;
    if (budget.limit > 0 && spent >= budget.limit) {
      await sendBudgetAlertEmail({
        category: budget.category,
        spent,
        limit: budget.limit,
      });
    }
  }
}

// Runs daily at 00:15
cron.schedule("15 0 * * *", async () => {
  try {
    console.log("[CRON] Running recurring transactions & budget checks...");
    await runRecurringTransactions();
    await checkBudgetAlerts();
    console.log("[CRON] Completed scheduled checks.");
  } catch (err) {
    console.error("[CRON] Job error:", err);
  }
});

module.exports = { runRecurringTransactions, checkBudgetAlerts };
