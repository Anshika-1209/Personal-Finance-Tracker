const express = require("express");

const {
getBudgets,
createOrUpdateBudget,
deleteBudget,
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createOrUpdateBudget);
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;
