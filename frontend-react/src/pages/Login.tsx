import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes" aria-hidden="true">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-layout">
        <div className="login-branding">
          <img src="/usiu-logo.png" alt="USIU-Africa logo" className="branding-logo-img" />
          <h2 className="branding-subtitle">Campus Event Management System</h2>
          <p>
            Discover events tailored to your school, program and year of study.
            Register in seconds and get real-time notifications for what matters to you.
          </p>
          <ul className="branding-features">
            <li>
              <i className="fas fa-star"></i> Smart event recommendations
            </li>
            <li>
              <i className="fas fa-bell"></i> Real-time notifications
            </li>
            <li>
              <i className="fas fa-ticket-alt"></i> Instant event tickets
            </li>
            <li>
              <i className="fas fa-users"></i> Clubs, workshops & competitions
            </li>
          </ul>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h3>Welcome Back</h3>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@usiu.ac.ke"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {error && <div className="error-message">{error}</div>}
          </form>

          <p className="login-register-link">
            New student? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
