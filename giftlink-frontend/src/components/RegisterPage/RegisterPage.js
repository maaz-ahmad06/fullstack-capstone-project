import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './RegisterPage.css';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      /**
       * Task 9 Requirement:
       * fetch request containing the required method and header attributes
       */
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: cleanEmail,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      // Registration successful, navigate to login page
      navigate('/app/login', { state: { message: 'Registration successful! Please login with your credentials.' } });
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon"><i className="bi bi-person-plus-fill"></i></div>
          <h2>Create an Account</h2>
          <p>Join the GiftLink community to give and receive items.</p>
        </div>

        {error && <div className="alert-error"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 6 characters)</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span><i className="bi bi-arrow-repeat spin-icon"></i> Creating Account...</span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/app/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
