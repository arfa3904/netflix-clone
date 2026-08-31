import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (uname.trim().length < 3) return 'Username must be at least 3 characters.';
    if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (!PHONE_RE.test(phone.trim())) return 'Enter a valid phone number (7-15 digits).';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({ uname: uname.trim(), email: email.trim(), phone: phone.trim(), password });
      navigate('/', { replace: true });
      // No setLoading(false) here — navigation unmounts this component on
      // success, so resetting state afterwards would just be a stray
      // setState on an unmounting component.
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
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
          <h2 className="auth-showcase-title">Your next favorite movie is one search away.</h2>
          <p className="auth-showcase-sub">Create a free account to start browsing.</p>
        </div>
      </div>

      <div className="auth-panel-wrap">
        <div className="auth-panel">
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">It only takes a minute.</p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <label className="auth-field">
              <span className="auth-label">Username</span>
              <input
                type="text"
                placeholder="janedoe"
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                className="auth-input"
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Phone</span>
              <input
                type="tel"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-input"
                autoComplete="tel"
                disabled={loading}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  autoComplete="new-password"
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

            <label className="auth-field">
              <span className="auth-label">Confirm password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                autoComplete="new-password"
                disabled={loading}
              />
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
