import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

const budgetLimits = [
  { category: 'Food', limit: 6000, color: '#7c5cff' },
  { category: 'Shopping', limit: 5000, color: '#f59e0b' },
  { category: 'Transport', limit: 3000, color: '#0ea5e9' },
  { category: 'Entertainment', limit: 2500, color: '#ef4444' },
];

const categoryColors = {
  Housing: '#7c5cff',
  Food: '#0ea5e9',
  Shopping: '#f59e0b',
  Transport: '#10b981',
  Entertainment: '#ef4444',
  Salary: '#10b981',
};

function parseDate(value) {
  if (!value) return new Date(NaN);

  const dateText = String(value).slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return new Date(`${dateText}T00:00:00`);
  }

  return new Date(value);
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}

function App() {
  const [month, setMonth] = useState('October 2026');
  const [activePage, setActivePage] = useState('Dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setLoadError('');

      try {
        const response = await fetch(`${API_URL}/transactions`);

        if (!response.ok) {
          throw new Error('Could not load transactions from the server.');
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('The server returned an unexpected response.');
        }

        if (!cancelled) {
          setTransactions(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error.message || 'Could not connect to the backend server.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const [selectedMonth, selectedYear] = month.split(' ');
  const selectedMonthIndex = new Date(
    `${selectedMonth} 1, ${selectedYear}`
  ).getMonth();
  const selectedYearNumber = Number(selectedYear);

  const filteredTransactions = transactions.filter((transaction) => {
    const date = parseDate(transaction.date);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getMonth() === selectedMonthIndex &&
      date.getFullYear() === selectedYearNumber
    );
  });

  const income = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const categoryTotals = Object.values(
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((totals, transaction) => {
        const name = transaction.category || 'Other';

        if (!totals[name]) {
          totals[name] = {
            name,
            amount: 0,
            color: categoryColors[name] || '#f472b6',
          };
        }

        totals[name].amount += Number(transaction.amount || 0);
        return totals;
      }, {})
  );

  const totalCategorySpending = categoryTotals.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  // Correct donut chart: each category gets its own cumulative slice.
  let currentPercentage = 0;

  const donutStops = categoryTotals.map((category) => {
    const start = currentPercentage;
    currentPercentage += totalCategorySpending > 0
      ? (category.amount / totalCategorySpending) * 100
      : 0;

    return `${category.color} ${start}% ${currentPercentage}%`;
  });

  const donutBackground =
    totalCategorySpending > 0
      ? `conic-gradient(${donutStops.join(', ')})`
      : '#e5e7eb';

  const budgets = budgetLimits.map((budget) => {
    const spent = filteredTransactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.category || '').toLowerCase() ===
            budget.category.toLowerCase()
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const percentage =
      budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    return {
      ...budget,
      spent,
      percentage,
      exceeded: spent > budget.limit,
    };
  });

  // Six-month trend ending with the selected month.
  const monthlyReport = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      selectedYearNumber,
      selectedMonthIndex - (5 - index),
      1
    );

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = parseDate(transaction.date);

      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      label: date.toLocaleString('en-IN', { month: 'short' }),
      year: date.getFullYear(),
      income: monthlyIncome,
      expenses: monthlyExpenses,
    };
  });

  // Automatic scaling keeps the largest bar at 150px.
  const chartMaximum = Math.max(
    1,
    ...monthlyReport.flatMap((item) => [item.income, item.expenses])
  );

  const chartHeight = 150;

  async function handleAddTransaction(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get('title') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const amount = Number(formData.get('amount'));
    const type = String(formData.get('type') || 'expense');
    const date = String(formData.get('date') || '');

    if (!title || !category || !date) {
      alert('Please fill in all transaction fields.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter an amount greater than zero.');
      return;
    }

    if (!['income', 'expense'].includes(type)) {
      alert('Please select a valid transaction type.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, amount, type, date }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Could not save the transaction.');
      }

      const savedTransaction = await response.json();

      if (savedTransaction && savedTransaction._id) {
        setTransactions((previous) => [savedTransaction, ...previous]);
      } else {
        setRefreshKey((key) => key + 1);
      }

      form.reset();
      alert('Transaction saved successfully!');
    } catch (error) {
      alert(
        error.message ||
          'Could not save the transaction. Check that your backend is running.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h2>FinTrack</h2>
            <span>PERSONAL FINANCE</span>
          </div>
        </div>

        
<p className="nav-label">WORKSPACE</p>

<button
  className={`nav-item ${activePage === 'Dashboard' ? 'active' : ''}`}
  onClick={() => setActivePage('Dashboard')}
>
  <span>▦</span> Dashboard
</button>

<button
  className={`nav-item ${activePage === 'Budgets' ? 'active' : ''}`}
  onClick={() => setActivePage('Budgets')}
>
  <span>◷</span> Budgets
</button>

<button
  className="nav-item"
  onClick={() => alert('Reports will be connected next!')}
>
  <span>▥</span> Reports
</button>

<button
  className="nav-item"
  onClick={() => alert('Transaction management will be connected next!')}
>
  <span>↕</span> Transactions
</button>


        <div className="sidebar-bottom">
          <div className="help-card">
            <span>✦</span>
            <strong>Smart money habits</strong>
            <p>Small savings today create a better tomorrow.</p>
          </div>
          <div className="profile">
            <div className="avatar">D</div>
            <div>
              <strong>My Account</strong>
              <small>Personal workspace</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            <span className="demo-label">LIVE DATA</span>
            <div className="avatar small">D</div>
          </div>
        </header>

        {activePage === 'Dashboard' && (
         <>
           <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR FINANCIAL OVERVIEW</p>
            <h1>Good day! <span>✦</span></h1>
            <p className="subtitle">
              Here's what's happening with your money.
            </p>
          </div>

          <select
            className="month-select"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-label="Select dashboard month"
          >
            <option>October 2026</option>
            <option>September 2026</option>
            <option>August 2026</option>
          </select>
        </section>

        {loadError && (
          <div role="alert" className="panel">
            <p>{loadError}</p>
            <button
              className="text-button"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <p className="card-note">Loading your transactions...</p>
        )}

        <section className="summary-grid">
          <article className="summary-card balance-card">
            <div className="card-heading">
              <span>Total balance</span>
              <span className="card-icon purple">₹</span>
            </div>
            <h2>₹{formatMoney(balance)}</h2>
            <p className="card-note">Income minus expenses for {month}</p>
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Total income</span>
              <span className="card-icon green">↙</span>
            </div>
            <h2>₹{formatMoney(income)}</h2>
            <p className="card-note positive">Money received in {month}</p>
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Total expenses</span>
              <span className="card-icon orange">↗</span>
            </div>
            <h2>₹{formatMoney(expenses)}</h2>
            <p className="card-note">Money spent in {month}</p>
          </article>

          <article className="summary-card savings-card">
            <div className="card-heading">
              <span>Monthly savings</span>
              <span className="card-icon blue">✧</span>
            </div>
            <h2>{savingsRate}%</h2>
            <p className="card-note">Of income retained</p>
            <div className="savings-track">
              <span
                style={{
                  width: `${Math.max(0, Math.min(savingsRate, 100))}%`,
                }}
              ></span>
            </div>
          </article>
        </section>

        <section className="analytics-grid">
          <article className="panel spending-panel">
            <div className="panel-heading">
              <div>
                <h3>Spending by category</h3>
                <p>Where your money goes in {month}</p>
              </div>
              <span className="pill">{month}</span>
            </div>

            <div className="category-layout">
              <div className="donut-wrap">
                <div
                  className="donut"
                  style={{ background: donutBackground }}
                >
                  <div className="donut-center">
                    <strong>₹{formatMoney(totalCategorySpending)}</strong>
                    <span>Total spent</span>
                  </div>
                </div>
              </div>

              <div className="legend">
                {categoryTotals.length > 0 ? (
                  categoryTotals.map((category) => (
                    <div className="legend-row" key={category.name}>
                      <span
                        className="legend-dot"
                        style={{ background: category.color }}
                      ></span>
                      <span className="legend-name">{category.name}</span>
                      <strong>₹{formatMoney(category.amount)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="card-note">
                    No expenses recorded for {month}.
                  </p>
                )}
              </div>
            </div>
          </article>

          <article className="panel budget-panel">
            <div className="panel-heading">
              <div>
                <h3>Budget overview</h3>
                <p>Spending limits for {month}</p>
              </div>
              <button
                className="text-button"
                onClick={() => setActivePage('Budgets')}
              >
                Manage budgets ↗
              </button>
            </div>

            <div className="budget-list">
              {budgets.map((budget) => {
                const percentage = Math.round(budget.percentage);
                const over = budget.exceeded;
                const nearLimit = percentage >= 80 && !over;

                return (
                  <div className="budget-row" key={budget.category}>
                    <div className="budget-meta">
                      <strong>{budget.category}</strong>
                      <span>
                        ₹{formatMoney(budget.spent)} / ₹
                        {formatMoney(budget.limit)}
                      </span>
                    </div>

                    <div className="budget-track">
                      <span
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: budget.color,
                        }}
                      ></span>
                    </div>

                    <div
                      className={
                        over || nearLimit
                          ? 'budget-warning'
                          : 'budget-percent'
                      }
                    >
                      {over
                        ? `⚠ Over budget by ₹${formatMoney(
                            budget.spent - budget.limit
                          )}`
                        : nearLimit
                          ? `⚠ ${percentage}% used — approaching limit`
                          : `${percentage}% used — within budget`}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="panel monthly-panel">
          <div className="panel-heading">
            <div>
              <h3>Income vs expenses</h3>
              <p>Six-month trend ending in {month}</p>
            </div>
            <div className="chart-legend">
              <span><i className="legend-income"></i> Income</span>
              <span><i className="legend-expense"></i> Expenses</span>
            </div>
          </div>

          <div className="bar-chart">
            {monthlyReport.map((item) => (
              <div
                className="bar-group"
                key={`${item.label}-${item.year}`}
              >
                <div className="bar-pair">
                  <div
                    className="bar income-bar"
                    title={`Income ₹${formatMoney(item.income)}`}
                    style={{
                      height:
                        item.income > 0
                          ? `${Math.max(
                              4,
                              (item.income / chartMaximum) * chartHeight
                            )}px`
                          : '0px',
                    }}
                  ></div>
                  <div
                    className="bar expense-bar"
                    title={`Expenses ₹${formatMoney(item.expenses)}`}
                    style={{
                      height:
                        item.expenses > 0
                          ? `${Math.max(
                              4,
                              (item.expenses / chartMaximum) * chartHeight
                            )}px`
                          : '0px',
                    }}
                  ></div>
                </div>
                <span>{item.label}</span>
                <small>{item.year}</small>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={handleAddTransaction} className="transaction-form">
          <h3>Add Transaction</h3>

          <input
            name="title"
            placeholder="Transaction name"
            maxLength="100"
            required
          />

          <input
            name="category"
            placeholder="Category (Food, Salary...)"
            maxLength="50"
            required
          />

          <input
            name="amount"
            type="number"
            placeholder="Amount (₹)"
            min="0.01"
            step="0.01"
            required
          />

          <select name="type" defaultValue="expense">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            name="date"
            type="date"
            defaultValue={new Date().toLocaleDateString('en-CA')}
            required
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>

        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent transactions</h3>
              <p>Transactions recorded in {month}</p>
            </div>
            <span className="pill">
              {filteredTransactions.length} transactions
            </span>
          </div>

          <div className="transaction-table">
            <div className="transaction-header">
              <span>TRANSACTION</span>
              <span>CATEGORY</span>
              <span>DATE</span>
              <span>AMOUNT</span>
            </div>

            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <div
                  className="transaction-row"
                  key={
                    transaction._id ||
                    `${transaction.title}-${transaction.date}-${index}`
                  }
                >
                  <div className="transaction-title">
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'transaction-icon income-icon'
                          : 'transaction-icon expense-icon'
                      }
                    >
                      {transaction.type === 'income' ? '↓' : '↑'}
                    </span>
                    <strong>{transaction.title}</strong>
                  </div>

                  <span className="transaction-category">
                    {transaction.category}
                  </span>

                  <span className="transaction-date">
                    {parseDate(transaction.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <strong
                    className={
                      transaction.type === 'income'
                        ? 'amount-income'
                        : 'amount-expense'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}₹
                    {formatMoney(transaction.amount)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="card-note">
                {loading
                  ? 'Loading transactions...'
                  : `No transactions found for ${month}.`}
              </p>
            )}
          </div>
        </section>

        <footer className="footer">
          <span>FinTrack</span> · Personal Finance Tracker <span>•</span> Built
          to make money clearer.
        </footer>
          </>
        )}

        {activePage === 'Budgets' && (
          
<section className="panel budget-panel">
  <div className="panel-heading">
    <div>
      <h3>Budgets</h3>
      <p>Spending limits for {month}</p>
    </div>
    <button
      className="text-button"
      onClick={() => setActivePage('Dashboard')}
    >
      ← Back to Dashboard
    </button>
  </div>

  <div className="budget-list">
    {budgets.map((budget) => {
      const percentage = Math.round(budget.percentage);

      return (
        <div className="budget-row" key={budget.category}>
          <div className="budget-meta">
            <strong>{budget.category}</strong>
            <span>
              ₹{formatMoney(budget.spent)} / ₹{formatMoney(budget.limit)}
            </span>
          </div>

          <div className="budget-track">
            <span
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background: budget.color,
              }}
            />
          </div>

          <p className={budget.exceeded ? 'budget-warning' : 'budget-percent'}>
            {budget.exceeded
              ? `Over budget by ₹${formatMoney(budget.spent - budget.limit)}`
              : `${percentage}% used`}
          </p>
        </div>
      );
    })}
  </div>
</section>

        )}
        </main>
      
    </div>
  );
}

export default App; 