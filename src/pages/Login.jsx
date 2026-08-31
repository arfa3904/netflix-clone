import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError(loginType === 'email' ? 'Enter your email.' : 'Enter your mobile number.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      const redirectTo = location.state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-showcase">
        <div className="auth-showcase-glow" aria-hidden="true" />
        <div className="auth-showcase-content">
          <p className="auth-brand">
            Cine<span className="navbar-logo-accent">Vault</span>
          </p>
          <h2 className="auth-showcase-title">Unlimited movies, curated for you.</h2>
          <p className="auth-showcase-sub">Sign in to pick up where you left off.</p>
        </div>
      </div>

      <div className="auth-panel-wrap">
        <div className="auth-panel">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to continue browsing.</p>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'email'}
              className={`auth-tab ${loginType === 'email' ? 'auth-tab-active' : ''}`}
              onClick={() => setLoginType('email')}
            >
              Email
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loginType === 'mobile'}
              className={`auth-tab ${loginType === 'mobile' ? 'auth-tab-active' : ''}`}
              onClick={() => setLoginType('mobile')}
            >
              Mobile number
            </button>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <label className="auth-field">
              <span className="auth-label">{loginType === 'email' ? 'Email' : 'Mobile number'}</span>
              <input
                type={loginType === 'email' ? 'email' : 'tel'}
                placeholder={loginType === 'email' ? 'you@example.com' : '+1 555 000 0000'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="auth-input"
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don&rsquo;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
