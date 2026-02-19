import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, setStoredUser } from '../services/auth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('email');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Enter your email or phone number.');
      return;
    }
    if (!password.trim()) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ identifier: identifier.trim(), password });
      if (data.success && data.user) {
        setStoredUser(data.user);
        navigate('/', { replace: true });
      } else {
        setError(data.message || 'Login failed. Try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-content">
          <div className="login-left-card">
            <h2 className="login-left-title">Welcome to the community</h2>
            <p className="login-left-sub">Login to explore</p>
          </div>
          <div className="login-dots">
            <span className="login-dot login-dot-active" />
            <span className="login-dot" />
            <span className="login-dot" />
            <span className="login-dot" />
            <span className="login-dot" />
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-panel">
          <h1 className="login-title">Login your account!</h1>

          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${loginType === 'email' ? 'login-tab-active' : ''}`}
              onClick={() => setLoginType('email')}
            >
              E-mail
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === 'mobile' ? 'login-tab-active' : ''}`}
              onClick={() => setLoginType('mobile')}
            >
              Mobile Number
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden>✉</span>
              <input
                type="text"
                placeholder={loginType === 'email' ? 'Email' : 'Mobile Number'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="login-input"
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="login-password-row">
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden>🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              <a href="#forgot" className="login-forgot">Forgot password?</a>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Continue'}
            </button>
          </form>

          <div className="login-divider">
            <span>Sign in With</span>
          </div>
          <div className="login-social">
            <button type="button" className="login-social-btn" aria-label="Facebook" title="Facebook">f</button>
            <button type="button" className="login-social-btn login-social-google" aria-label="Google" title="Google">G</button>
            <button type="button" className="login-social-btn login-social-apple" aria-label="Apple" title="Apple">⌘</button>
          </div>

          <p className="login-footer">
            Dont have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
