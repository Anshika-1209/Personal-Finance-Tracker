import { useEffect, useState } from "react";
import {
BrowserRouter,
Routes,
Route,
Navigate,
Link,
useNavigate,
useLocation,
} from "react-router-dom";

import {
PieChart,
Pie,
Cell,
Tooltip,
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Legend,
} from "recharts";

import "./App.css";

const API_URL = "http://localhost:5000/api";

const CHART_COLORS = [
"#a7f36a",
"#5eead4",
"#60a5fa",
"#c084fc",
"#fb923c",
"#f472b6",
"#facc15",
"#94a3b8",
];

const BUDGET_CATEGORIES = [
"Food",
"Transport",
"Shopping",
"Education",
"Entertainment",
"Bills",
"Other",
];

const TRANSACTION_CATEGORIES = [
"Food",
"Transport",
"Shopping",
"Education",
"Salary",
"Entertainment",
"Bills",
"Other",
];

function getToday() {
const date = new Date();
const localDate = new Date(
date.getTime() - date.getTimezoneOffset() * 60000
);

return localDate.toISOString().slice(0, 10);
}

function getCurrentMonth() {
return getToday().slice(0, 7);
}

function formatCurrency(amount) {
return `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

async function readResponse(response) {
const data = await response.json().catch(() => ({}));

if (!response.ok) {
throw new Error(
data.message || "Something went wrong. Please try again."
);
}

return data;
}

/* =========================
HOME PAGE
========================= */

function Home() {
return ( <div className="app"> <nav className="navbar"> <Link to="/" className="logo"> <span className="logo-icon">₹</span> Finora </Link>

```
    <div className="nav-links">
      <a href="#features">Features</a>
      <a href="#about">About</a>
    </div>

    <div className="nav-actions">
      <Link to="/login" className="login-link">
        Log in
      </Link>

      <Link to="/register" className="nav-button">
        Get Started ↗
      </Link>
    </div>
  </nav>

  <main className="hero">
    <div className="hero-content">
      <div className="badge">
        <span className="status-dot"></span>
        YOUR MONEY, YOUR CONTROL
      </div>

      <h1>
        Make your money
        <br />
        work <span>smarter.</span>
      </h1>

      <p className="hero-description">
        Take control of your finances with one simple dashboard.
        Track expenses, manage budgets, and build better money habits.
      </p>

      <div className="hero-buttons">
        <Link to="/register" className="primary-button">
          Start for free <span>↗</span>
        </Link>

        <a href="#features" className="secondary-button">
          Explore features ↓
        </a>
      </div>

      <div className="trust-note">
        <div className="avatar-stack">
          <span>A</span>
          <span>R</span>
          <span>S</span>
        </div>

        <p>
          <strong>One dashboard.</strong> Better financial decisions.
        </p>
      </div>
    </div>

    <div className="preview-wrapper">
      <div className="dashboard-preview">
        <div className="preview-top">
          <div>
            <span className="muted-text">TOTAL BALANCE</span>
            <h2>₹48,562.00</h2>

            <span className="positive">
              ↗ Your financial overview
            </span>
          </div>

          <div className="balance-icon">₹</div>
        </div>

        <div className="preview-stats">
          <div className="stat-card">
            <span>↗ Monthly income</span>
            <h3>₹65,000</h3>
            <small>Money coming in</small>
          </div>

          <div className="stat-card">
            <span>↘ Monthly expenses</span>
            <h3>₹16,438</h3>
            <small>Money going out</small>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-heading">
            <div>
              <strong>Spending overview</strong>
              <p>Your monthly activity</p>
            </div>

            <span className="chart-period">This week⌄</span>
          </div>

          <div className="chart">
            {[
              35, 55, 42, 78, 48, 65, 90, 52, 72, 44, 60, 82,
            ].map((height, index) => (
              <div className="bar-column" key={index}>
                <div
                  className={`bar ${
                    index === 6 ? "highlight-bar" : ""
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>

          <div className="chart-labels">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day) => (
                <span key={day}>{day}</span>
              )
            )}
          </div>
        </div>

        <div className="preview-budget-card">
          <div className="budget-info">
            <span className="budget-icon">◉</span>

            <div>
              <strong>Monthly budget</strong>
              <p>Keep your spending on track</p>
            </div>
          </div>

          <div className="budget-amount">
            <strong>68%</strong>
            <span>used</span>
          </div>

          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>

          <div className="floating-card">
            <span className="floating-icon">✓</span>

            <div>
              <strong>You're on track!</strong>
              <p>Budget looking healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <section className="features" id="features">
    <div className="section-heading">
      <span>BUILT FOR YOUR FINANCIAL GOALS</span>
      <h2>Everything you need, all in one place.</h2>
    </div>

    <div className="feature-grid">
      <article className="feature-card">
        <div className="feature-icon">↗</div>
        <h3>Track expenses</h3>
        <p>
          Understand where your money goes and stay on top of daily
          spending.
        </p>
      </article>

      <article className="feature-card">
        <div className="feature-icon">◎</div>
        <h3>Smart budgets</h3>
        <p>
          Set spending limits, monitor progress, and build healthier
          habits.
        </p>
      </article>

      <article className="feature-card">
        <div className="feature-icon">▥</div>
        <h3>Clear reports</h3>
        <p>
          See your financial activity through simple summaries and
          insights.
        </p>
      </article>
    </div>
  </section>

  <footer id="about">
    <Link to="/" className="logo">
      <span className="logo-icon">₹</span> Finora
    </Link>

    <p>Small steps today. Stronger finances tomorrow.</p>

    <span>© 2026 Finora · Personal Finance Tracker</span>
  </footer>
</div>

);
}

/* =========================
LOGIN AND REGISTER
========================= */

function AuthPage({
title,
subtitle,
buttonText,
footerText,
footerLink,
footerLinkText,
isRegister = false,
}) {
const navigate = useNavigate();
const location = useLocation();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [submitting, setSubmitting] = useState(false);

const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState(
!isRegister ? location.state?.message || "" : ""
);

async function handleSubmit(e) {
e.preventDefault();


setErrorMessage("");
setSuccessMessage("");

if (isRegister && !name.trim()) {
  setErrorMessage("Please enter your name.");
  return;
}

if (!email.trim() || !password) {
  setErrorMessage("Please enter your email and password.");
  return;
}

if (isRegister && password.length < 8) {
  setErrorMessage("Password must contain at least 8 characters.");
  return;
}

setSubmitting(true);

try {
  const endpoint = isRegister ? "register" : "login";

  const requestBody = isRegister
    ? {
        name: name.trim(),
        email: email.trim(),
        password,
      }
    : {
        email: email.trim(),
        password,
      };

  const response = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await readResponse(response);

  if (isRegister) {
    navigate("/login", {
      replace: true,
      state: {
        message: "Account created successfully! Please log in.",
      },
    });
    return;
  }

  if (!data.token) {
    throw new Error(
      "Login response did not contain an authentication token."
    );
  }

  localStorage.setItem("finora-token", data.token);
  localStorage.setItem(
    "finora-user",
    JSON.stringify(data.user || {})
  );

  navigate("/dashboard", { replace: true });
} catch (error) {
  console.error("Authentication error:", error);

  setErrorMessage(
    error.message ||
      "Unable to connect to Finora server. Please try again."
  );
} finally {
  setSubmitting(false);
}


}

return ( <div className="auth-page"> <Link to="/" className="logo auth-logo"> <span className="logo-icon">₹</span> Finora </Link>


  <form className="auth-card" onSubmit={handleSubmit}>
    <div className="auth-symbol">₹</div>

    <h1>{title}</h1>
    <p className="auth-subtitle">{subtitle}</p>

    {errorMessage && (
      <div className="auth-error" role="alert">
        {errorMessage}
      </div>
    )}

    {successMessage && (
      <div className="auth-success" role="status">
        {successMessage}
      </div>
    )}

    {isRegister && (
      <label>
        Full name

        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </label>
    )}

    <label>
      Email address

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
    </label>

    <label>
      Password

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={
          isRegister ? "new-password" : "current-password"
        }
        minLength={isRegister ? 8 : undefined}
        required
      />
    </label>

    <button
      className="auth-submit"
      type="submit"
      disabled={submitting}
    >
      {submitting ? "Please wait..." : `${buttonText} →`}
    </button>

    <p className="auth-footer">
      {footerText} <Link to={footerLink}>{footerLinkText}</Link>
    </p>

    <Link to="/" className="back-home">
      ← Back to home
    </Link>
  </form>
</div>

);
}

function Login() {
return ( <AuthPage
   title="Welcome back."
   subtitle="Log in to pick up where you left off."
   buttonText="Log in"
   footerText="Don't have an account?"
   footerLink="/register"
   footerLinkText="Create one"
 />
);
}

function Register() {
return ( <AuthPage
   title="Start your journey."
   subtitle="Create an account and take charge of your money."
   buttonText="Create account"
   footerText="Already have an account?"
   footerLink="/login"
   footerLinkText="Log in"
   isRegister
 />
);
}

/* =========================
DASHBOARD
========================= */

function Dashboard() {
const navigate = useNavigate();

const token = localStorage.getItem("finora-token");

let user = null;

try {
user = JSON.parse(localStorage.getItem("finora-user") || "null");
} catch {
user = null;
}

const [transactions, setTransactions] = useState([]);
const [budgets, setBudgets] = useState([]);

const [budgetCategory, setBudgetCategory] = useState("Food");
const [budgetAmount, setBudgetAmount] = useState("");
const [budgetMonth, setBudgetMonth] = useState(getCurrentMonth());

const [loadingBudgets, setLoadingBudgets] = useState(false);
const [savingBudget, setSavingBudget] = useState(false);

const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);

const [loadingTransactions, setLoadingTransactions] = useState(true);
const [savingTransaction, setSavingTransaction] = useState(false);

const [form, setForm] = useState({
title: "",
amount: "",
type: "expense",
category: "Food",
date: getToday(),
});

function handleUnauthorized() {
localStorage.removeItem("finora-token");
localStorage.removeItem("finora-user");


navigate("/login", { replace: true });


}

/* Load transactions */

useEffect(() => {
if (!token) {
setLoadingTransactions(false);
return;
}


let cancelled = false;

async function fetchTransactions() {
  setLoadingTransactions(true);

  try {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    const data = await readResponse(response);

    if (cancelled) return;

    const transactionList = Array.isArray(data)
      ? data
      : Array.isArray(data.transactions)
        ? data.transactions
        : [];

    setTransactions(
      transactionList.map((transaction) => ({
        ...transaction,
        id: transaction._id || transaction.id,
        amount: Number(transaction.amount),
        date: transaction.date
          ? String(transaction.date).slice(0, 10)
          : "",
      }))
    );
  } catch (error) {
    if (!cancelled) {
      console.error("Fetch transactions error:", error);

      alert(error.message || "Unable to load transactions.");
    }
  } finally {
    if (!cancelled) {
      setLoadingTransactions(false);
    }
  }
}

fetchTransactions();

return () => {
  cancelled = true;
};


}, [token]);

/* Load budgets */

async function fetchBudgets(month = budgetMonth) {
if (!token || !month) return;


setLoadingBudgets(true);

try {
  const response = await fetch(
    `${API_URL}/budgets?month=${encodeURIComponent(month)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await readResponse(response);

  setBudgets(Array.isArray(data.budgets) ? data.budgets : []);
} catch (error) {
  console.error("Fetch budgets error:", error);

  alert(error.message || "Unable to load budgets.");
} finally {
  setLoadingBudgets(false);
}


}

useEffect(() => {
if (token) {
fetchBudgets(budgetMonth);
}
}, [token, budgetMonth]);

/* Logout */

function handleLogout() {
localStorage.removeItem("finora-token");
localStorage.removeItem("finora-user");


navigate("/login", { replace: true });


}

/* Budget create/update */

async function handleBudgetSubmit(e) {
e.preventDefault();


const amount = Number(budgetAmount);

if (
  !budgetCategory ||
  !budgetMonth ||
  !Number.isFinite(amount) ||
  amount <= 0
) {
  alert("Please enter a valid budget amount.");
  return;
}

setSavingBudget(true);

try {
  const response = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category: budgetCategory,
      amount,
      month: budgetMonth,
    }),
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await readResponse(response);

  await fetchBudgets(budgetMonth);

  setBudgetAmount("");

  alert(data.message || "Monthly budget saved successfully! 💚");
} catch (error) {
  console.error("Save budget error:", error);

  alert(error.message || "Unable to save budget.");
} finally {
  setSavingBudget(false);
}


}

/* Transaction totals */

const income = transactions
.filter((transaction) => transaction.type === "income")
.reduce(
(sum, transaction) => sum + Number(transaction.amount || 0),
0
);

const expenses = transactions
.filter((transaction) => transaction.type === "expense")
.reduce(
(sum, transaction) => sum + Number(transaction.amount || 0),
0
);

const balance = income - expenses;

/* Expense chart data */

const expenseCategoryData = Object.values(
transactions
.filter((transaction) => transaction.type === "expense")
.reduce((categories, transaction) => {
const category = transaction.category || "Other";


    if (!categories[category]) {
      categories[category] = {
        name: category,
        value: 0,
      };
    }

    categories[category].value += Number(transaction.amount || 0);

    return categories;
  }, {})


);

const incomeExpenseData = [
{
name: "Income",
amount: income,
},
{
name: "Expenses",
amount: expenses,
},
];

/* Add or edit transaction */

async function handleSubmit(e) {
e.preventDefault();


const amount = Number(form.amount);

if (
  !form.title.trim() ||
  !Number.isFinite(amount) ||
  amount <= 0 ||
  !form.category.trim() ||
  !form.date
) {
  alert("Please enter valid transaction details.");
  return;
}

const isEditing = editingId !== null;

setSavingTransaction(true);

try {
  const url = isEditing
    ? `${API_URL}/transactions/${editingId}`
    : `${API_URL}/transactions`;

  const response = await fetch(url, {
    method: isEditing ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
    }),
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await readResponse(response);
  const savedTransaction = data.transaction;

  if (!savedTransaction) {
    throw new Error(
      "The server did not return the saved transaction."
    );
  }

  const formattedTransaction = {
    ...savedTransaction,
    id: savedTransaction._id || savedTransaction.id,
    amount: Number(savedTransaction.amount),
    date: savedTransaction.date
      ? String(savedTransaction.date).slice(0, 10)
      : form.date,
  };

  if (isEditing) {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === editingId
          ? formattedTransaction
          : transaction
      )
    );
  } else {
    setTransactions((previous) => [
      formattedTransaction,
      ...previous,
    ]);
  }

  setForm({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: getToday(),
  });

  setEditingId(null);
  setShowForm(false);

  await fetchBudgets(budgetMonth);

  alert(
    isEditing
      ? "Transaction updated successfully! 💚"
      : "Transaction saved successfully! 💚"
  );
} catch (error) {
  console.error("Save transaction error:", error);

  alert(error.message || "Unable to save transaction.");
} finally {
  setSavingTransaction(false);
}


}

/* Delete transaction */

async function deleteTransaction(id) {
const confirmed = window.confirm(
"Are you sure you want to delete this transaction?"
);


if (!confirmed) return;

try {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await readResponse(response);

  setTransactions((previous) =>
    previous.filter((transaction) => transaction.id !== id)
  );

  await fetchBudgets(budgetMonth);

  if (data.message) {
    console.log(data.message);
  }
} catch (error) {
  console.error("Delete transaction error:", error);

  alert(error.message || "Unable to delete transaction.");
}


}

/* Edit transaction */

function handleEdit(transaction) {
setEditingId(transaction.id);


setForm({
  title: transaction.title || "",
  amount: String(transaction.amount ?? ""),
  type: transaction.type || "expense",
  category: transaction.category || "Other",
  date: transaction.date || getToday(),
});

setShowForm(true);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});


}

/* Cancel transaction editing */

function handleCancelForm() {
setShowForm(false);
setEditingId(null);


setForm({
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: getToday(),
});


}

/* Delete budget */

async function handleBudgetDelete(id) {
const confirmed = window.confirm("Delete this monthly budget?");


if (!confirmed) return;

try {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  await readResponse(response);

  setBudgets((previous) =>
    previous.filter((budget) => budget._id !== id)
  );
} catch (error) {
  console.error("Delete budget error:", error);

  alert(error.message || "Unable to delete budget.");
}


}

/* Authentication check */

if (!token) {
return <Navigate to="/login" replace />;
}

/* Dashboard UI */

return ( <div className="dashboard-page"> <aside className="sidebar"> <Link to="/" className="logo"> <span className="logo-icon">₹</span> Finora </Link>


    <p className="sidebar-label">WORKSPACE</p>

    <Link to="/dashboard" className="sidebar-item active">
      ▦ Overview
    </Link>

    <a href="#transactions" className="sidebar-item">
      ↕ Transactions
    </a>

    <a href="#budget" className="sidebar-item">
      ◎ Budgets
    </a>

    <a href="#reports" className="sidebar-item">
      ▥ Reports
    </a>

    <div className="sidebar-bottom">
      <Link to="/" className="sidebar-item">
        ← Back to home
      </Link>
    </div>
  </aside>

  <main className="dashboard-main">
    <header className="dashboard-header">
      <div>
        <p className="muted-text">YOUR FINANCES AT A GLANCE</p>

        <h1>Dashboard</h1>

        <p className="muted-text">
          Welcome back, {user?.name || "User"}! 💚
        </p>
      </div>

      <div className="dashboard-header-actions">
        <button
          className="nav-button"
          type="button"
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "+ Add Transaction"}
        </button>

        <button
          className="nav-button"
          type="button"
          onClick={handleLogout}
        >
          Logout ↗
        </button>
      </div>
    </header>

    <section className="welcome-panel">
      <span>WELCOME TO FINORA</span>

      <h2>Your financial journey starts here.</h2>

      <p>
        Track your money, manage expenses, and build better financial
        habits.
      </p>
    </section>

    <section className="transaction-stats">
      <article className="transaction-stat">
        <span>Total Balance</span>
        <h2>{formatCurrency(balance)}</h2>
      </article>

      <article className="transaction-stat">
        <span>Total Income</span>
        <h2>{formatCurrency(income)}</h2>
      </article>

      <article className="transaction-stat">
        <span>Total Expenses</span>
        <h2>{formatCurrency(expenses)}</h2>
      </article>
    </section>

    {/* Financial reports */}

    <section className="charts-section" id="reports">
      <div className="charts-heading">
        <h2>Financial Reports</h2>
        <p>Your income and spending at a glance.</p>
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h3>Expense Breakdown</h3>

          <p className="chart-subtitle">Spending by category</p>

          {expenseCategoryData.length === 0 ? (
            <div className="chart-empty">
              No expense data available yet.
            </div>
          ) : (
            <>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Expense",
                      ]}
                      contentStyle={{
                        backgroundColor: "#111a17",
                        border: "1px solid #34443b",
                        borderRadius: "10px",
                        color: "#edf3f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-legend">
                {expenseCategoryData.map((entry, index) => (
                  <div className="chart-legend-item" key={entry.name}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />

                    <span>{entry.name}</span>

                    <strong>{formatCurrency(entry.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="chart-card">
          <h3>Income vs Expenses</h3>

          <p className="chart-subtitle">
            Compare your total money flow
          </p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeExpenseData}
                margin={{
                  top: 15,
                  right: 8,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#91a09a",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: "#34443b",
                  }}
                  tickLine={false}
                />

                <YAxis
                  width={65}
                  tick={{
                    fill: "#91a09a",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "#111a17",
                    border: "1px solid #34443b",
                    borderRadius: "10px",
                    color: "#edf3f0",
                  }}
                />

                <Legend />

                <Bar
                  dataKey="amount"
                  name="Amount"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={65}
                >
                  {incomeExpenseData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Income"
                          ? "#a7f36a"
                          : "#fb8585"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>

    {/* Monthly budgets */}

    <section className="budget-section" id="budget">
      <div className="budget-heading">
        <div>
          <h2>Monthly Budgets</h2>
          <p>Set spending limits and track your progress.</p>
        </div>

        <input
          type="month"
          value={budgetMonth}
          onChange={(e) => setBudgetMonth(e.target.value)}
          aria-label="Select budget month"
        />
      </div>

      <form className="budget-form" onSubmit={handleBudgetSubmit}>
        <label>
          Category

          <select
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
          >
            {BUDGET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Monthly limit (₹)

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 3000"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            required
          />
        </label>

        <button
          className="nav-button"
          type="submit"
          disabled={savingBudget}
        >
          {savingBudget ? "Saving..." : "Save Budget"}
        </button>
      </form>

      {loadingBudgets ? (
        <p className="budget-message">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div className="budget-empty">
          No budgets set for this month yet.
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map((budget) => {
            const spent = Number(budget.spent || 0);
            const limit = Number(budget.amount || 0);

            const percentage =
              limit > 0 ? (spent / limit) * 100 : 0;

            const progressPercentage = Math.round(percentage);
            const exceeded = spent > limit;

            const barPercentage = Math.min(
              Math.max(percentage, 0),
              100
            );

            return (
              <article className="budget-card" key={budget._id}>
                <div className="budget-card-heading">
                  <div>
                    <h3>{budget.category}</h3>

                    <p>
                      {formatCurrency(spent)} spent of{" "}
                      {formatCurrency(limit)}
                    </p>
                  </div>

                  <button
                    className="delete-transaction"
                    type="button"
                    onClick={() => handleBudgetDelete(budget._id)}
                    aria-label={`Delete ${budget.category} budget`}
                    title="Delete budget"
                  >
                    ×
                  </button>
                </div>

                <div className="budget-progress-label">
                  <span>Budget Progress</span>

                  <strong className={exceeded ? "over-budget" : ""}>
                    {progressPercentage}%
                  </strong>
                </div>

                <div
                  className="budget-progress-track"
                  role="progressbar"
                  aria-label={`${budget.category} budget used`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={barPercentage}
                >
                  <div
                    className={`budget-progress-fill ${
                      exceeded ? "over-budget" : ""
                    }`}
                    style={{
                      width: `${barPercentage}%`,
                    }}
                  />
                </div>

                <p
                  className={
                    exceeded
                      ? "budget-warning"
                      : "budget-remaining"
                  }
                >
                  {exceeded
                    ? `Over budget by ${formatCurrency(
                        spent - limit
                      )}`
                    : `${formatCurrency(
                        limit - spent
                      )} remaining`}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>

    {/* Transaction form */}

    {showForm && (
      <form className="transaction-form" onSubmit={handleSubmit}>
        <h2>
          {editingId ? "Edit transaction" : "Add a transaction"}
        </h2>

        <label>
          Description

          <input
            type="text"
            placeholder="e.g. Groceries"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Amount (₹)

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Transaction type

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Category

          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            required
          />
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={savingTransaction}
        >
          {savingTransaction
            ? "Saving..."
            : editingId
              ? "Update Transaction →"
              : "Save Transaction →"}
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={handleCancelForm}
        >
          Cancel
        </button>
      </form>
    )}

    {/* Recent transactions */}

    <section className="transactions-section" id="transactions">
      <div className="transactions-heading">
        <div>
          <h2>Recent Transactions</h2>
          <p>Your latest income and expenses</p>
        </div>
      </div>

      {loadingTransactions ? (
        <div className="empty-transactions">
          <h3>Loading transactions...</h3>
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-transactions">
          <span>₹</span>

          <h3>No transactions yet</h3>

          <p>
            Add your first income or expense to get started.
          </p>

          <button
            className="nav-button"
            type="button"
            onClick={() => setShowForm(true)}
          >
            + Add your first transaction
          </button>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <article
              className="transaction-row"
              key={transaction.id}
            >
              <div className="transaction-icon">
                {transaction.type === "income" ? "↗" : "↘"}
              </div>

              <div className="transaction-details">
                <strong>{transaction.title}</strong>

                <span>
                  {transaction.category} · {transaction.date}
                </span>
              </div>

              <strong
                className={
                  transaction.type === "income"
                    ? "income-amount"
                    : "expense-amount"
                }
              >
                {transaction.type === "income" ? "+" : "−"}
                {formatCurrency(transaction.amount)}
              </strong>

              <button
                className="edit-transaction"
                type="button"
                onClick={() => handleEdit(transaction)}
                aria-label={`Edit ${transaction.title}`}
                title="Edit transaction"
              >
                ✎
              </button>

              <button
                className="delete-transaction"
                type="button"
                onClick={() => deleteTransaction(transaction.id)}
                aria-label={`Delete ${transaction.title}`}
                title="Delete transaction"
              >
                ×
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
</div>


);
}

/* =========================
APP ROUTES
========================= */

function App() {
return ( <BrowserRouter> <Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="*" element={<Navigate to="/" replace />} /> </Routes> </BrowserRouter>
);
}

export default App;
