import { useState } from 'react';
import './Auth.css';

const API_URL = 'http://localhost:5000/api';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'INR',
    monthlyIncome: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        const registerResponse = await fetch(
          `${API_URL}/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              currency: formData.currency,
              monthlyIncome: Number(formData.monthlyIncome || 0),
            }),
          }
        );

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(
            registerData.message || 'Registration failed.'
          );
        }
      }

      // Login after registration or directly for existing users.
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Login failed.');
      }

      sessionStorage.setItem('finoraToken', loginData.token);
      sessionStorage.setItem(
        'finoraUser',
        JSON.stringify(loginData.user)
      );

      onAuthSuccess(loginData.user, loginData.token);
    } catch (error) {
      setError(
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin((previous) => !previous);
    setError('');

    setFormData({
      name: '',
      email: '',
      password: '',
      currency: 'INR',
      monthlyIncome: '',
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">₹</div>
          <div>
            <h1>FinTrack</h1>
            <span>PERSONAL FINANCE</span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="auth-eyebrow">
            {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
          </p>

          <h2>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>

          <p>
            {isLogin
              ? 'Sign in to manage your finances.'
              : 'Start building better money habits today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                maxLength="60"
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            minLength="8"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />

          {!isLogin && (
            <>
              <label htmlFor="currency">Preferred currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>

              <label htmlFor="monthlyIncome">Monthly income</label>
              <input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                placeholder="Enter monthly income"
                min="0"
                step="0.01"
                value={formData.monthlyIncome}
                onChange={handleChange}
              />
            </>
          )}

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button type="button" onClick={switchMode}>
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <p className="auth-footer">
          Your money. Your goals. Your future. 💚
        </p>
      </div>
    </div>
  );
}

export default Auth;