const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./models/Transaction');

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

