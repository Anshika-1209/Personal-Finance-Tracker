const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

const app = express();

app.use(cors());
app.use(express.json());

// Test backend
app.get('/', (req, res) => {
  res.send('Personal Finance Tracker Backend is running!');
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dashboard summary using MongoDB aggregation
console.log('DASHBOARD SUMMARY ROUTE LOADED');
app.get('/api/dashboard-summary', async (req, res) => {
  console.log('DASHBOARD SUMMARY REQUEST RECEIVED');
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income =
      summary.find((item) => item._id === 'income')?.total || 0;

    const expenses =
      summary.find((item) => item._id === 'expense')?.total || 0;

    // Category-wise expense report
    const categoryReport = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly income and expense report
    const monthlyReport = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    res.json({
      income,
      expenses,
      balance: income - expenses,
      savingsRate:
        income > 0 ? ((income - expenses) / income) * 100 : 0,
      categoryReport,
      monthlyReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
   
// Monthly budget analysis using MongoDB aggregation
app.get('/api/budgets', async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        message: 'Please provide a valid month in YYYY-MM format.',
      });
    }

    const [year, monthNumber] = month.split('-').map(Number);

    const startDate = new Date(
      Date.UTC(year, monthNumber - 1, 1)
    );

    const endDate = new Date(
      Date.UTC(year, monthNumber, 1)
    );

    // Fetch budgets for the selected month
    const budgets = await Budget.find({ month }).sort({
      category: 1,
    });

    // Calculate actual expenses category-wise
    const spending = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    // Compare budget limits with actual spending
    const budgetReport = budgets.map((budget) => {
      const spent =
        spending.find(
          (item) => item._id === budget.category
        )?.spent || 0;

      const remaining = budget.limit - spent;

      return {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        color: budget.color,
        month: budget.month,
        spent,
        remaining,
        percentage:
          budget.limit > 0
            ? Number(((spent / budget.limit) * 100).toFixed(2))
            : 0,
        status: spent > budget.limit
          ? 'Exceeded'
          : 'Within Budget',
      };
    });

    res.status(200).json({
      month,
      budgets: budgetReport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create or update a monthly budget
app.post('/api/budgets', async (req, res) => {
  try {
    const { category, limit, color, month } = req.body;

    if (!category || !month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        message: 'Category and a valid month (YYYY-MM) are required.',
      });
    }

    if (limit === undefined || !Number.isFinite(Number(limit)) || Number(limit) <= 0) {
      return res.status(400).json({
        message: 'Budget limit must be greater than zero.',
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { category: category.trim(), month },
      {
        $set: {
          limit: Number(limit),
          color: color || '#7c5cff',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: 'Monthly budget saved successfully.',
      budget,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Delete a monthly budget
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid budget ID.',
      });
    }

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found.',
      });
    }

    res.status(200).json({
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
console.log(
  'Routes:',
  app.router.stack
    .filter((layer) => layer.route)
    .map((layer) => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`)
);
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });

