const Transaction = require("../models/Transaction");

const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (
      !title?.trim() ||
      amount === undefined ||
      amount === null ||
      !type ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required transaction details.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense.",
      });
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      title: title.trim(),
      amount: numericAmount,
      type,
      category: category.trim(),
      date: date || Date.now(),
      note: note?.trim() || "",
    });

    return res.status(201).json({
      message: "Transaction added successfully! 💚",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);

    return res.status(500).json({
      message: "Unable to create transaction.",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch transactions.",
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      message: "Transaction deleted successfully! 💚",
    });
  } catch (error) {
    console.error("Delete transaction error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid transaction ID.",
      });
    }

    return res.status(500).json({
      message: "Unable to delete transaction.",
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (
      !title?.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !["income", "expense"].includes(type) ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid transaction details.",
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        title: title.trim(),
        amount: Number(amount),
        type,
        category: category.trim(),
        ...(date ? { date } : {}),
        ...(note !== undefined ? { note: note.trim() } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      message: "Transaction updated successfully! 💚",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid transaction ID or date.",
      });
    }

    return res.status(500).json({
      message: "Unable to update transaction.",
    });
  }
};


module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
};