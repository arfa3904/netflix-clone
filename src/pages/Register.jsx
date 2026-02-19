import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!uname.trim()) {
      setError('Username is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await register({ uname: uname.trim(), email: email.trim(), phone: phone.trim(), password });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">NETFLIX</h1>
        <h2 className="auth-title">Create Account</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
            className="auth-input"
            autoComplete="username"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            autoComplete="email"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="auth-input"
            autoComplete="tel"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            autoComplete="new-password"
            disabled={loading}
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>.
        </p>
      </div>
    </div>
  );
}
