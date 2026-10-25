const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

async function getBudgets(req, res) {
try {
const { month } = req.query;


if (!/^\d{4}-\d{2}$/.test(month || "")) {
  return res.status(400).json({
    message: "Please provide a valid month in YYYY-MM format.",
  });
}

const budgets = await Budget.find({
  userId: req.userId,
  month,
}).sort({ category: 1 });

const transactions = await Transaction.find({
  userId: req.userId,
  type: "expense",
  date: {
    $gte: new Date(`${month}-01T00:00:00.000Z`),
    $lt: new Date(
      `${month === "9999-12" ? "9999-12" : nextMonth(month)}-01T00:00:00.000Z`
    ),
  },
});

const spendingByCategory = {};

transactions.forEach((transaction) => {
  const category = transaction.category;
  spendingByCategory[category] =
    (spendingByCategory[category] || 0) + transaction.amount;
});

const results = budgets.map((budget) => ({
  ...budget.toObject(),
  spent: spendingByCategory[budget.category] || 0,
  remaining:
    budget.amount - (spendingByCategory[budget.category] || 0),
}));

return res.json({ budgets: results });


} catch (error) {
console.error("Get budgets error:", error);
return res.status(500).json({ message: "Unable to fetch budgets." });
}
}

function nextMonth(month) {
const [year, monthNumber] = month.split("-").map(Number);

if (monthNumber === 12) {
return `${year + 1}-01`;
}

return `${year}-${String(monthNumber + 1).padStart(2, "0")}`;
}

async function createOrUpdateBudget(req, res) {
try {
const { category, amount, month } = req.body;
const numericAmount = Number(amount);


if (
  !category ||
  typeof category !== "string" ||
  !category.trim() ||
  !/^\d{4}-\d{2}$/.test(month || "") ||
  Number(month.slice(5, 7)) < 1 ||
  Number(month.slice(5, 7)) > 12 ||
  !Number.isFinite(numericAmount) ||
  numericAmount <= 0
) {
  return res.status(400).json({
    message: "Enter a valid category, month, and positive budget amount.",
  });
}

const budget = await Budget.findOneAndUpdate(
  {
    userId: req.userId,
    category: category.trim(),
    month,
  },
  {
    $set: {
      amount: numericAmount,
    },
  },
  {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  }
);

return res.status(200).json({
  message: "Budget saved successfully! 💚",
  budget,
});


} catch (error) {
console.error("Save budget error:", error);
return res.status(500).json({ message: "Unable to save budget." });
}
}

async function deleteBudget(req, res) {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid budget ID." });
}


const budget = await Budget.findOneAndDelete({
  _id: req.params.id,
  userId: req.userId,
});

if (!budget) {
  return res.status(404).json({ message: "Budget not found." });
}

return res.json({ message: "Budget deleted successfully." });


} catch (error) {
console.error("Delete budget error:", error);
return res.status(500).json({ message: "Unable to delete budget." });
}
}

module.exports = {
getBudgets,
createOrUpdateBudget,
deleteBudget,
};
