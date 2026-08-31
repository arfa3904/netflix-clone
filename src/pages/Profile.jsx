import { useEffect, useState } from 'react';
import { fetchProfile } from '../services/profile';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Profile.css';

function formatDate(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((data) => {
        if (!cancelled) setProfile(data.profile);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load your profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <h1 className="profile-title">Profile</h1>

        {loading && (
          <div className="profile-card profile-skeleton" role="status" aria-live="polite">
            Loading your profile…
          </div>
        )}

        {!loading && error && (
          <div className="profile-card profile-state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="profile-card">
            <div className="profile-avatar" aria-hidden="true">
              {profile.uname?.charAt(0).toUpperCase() || '?'}
            </div>
            <dl className="profile-fields">
              <div className="profile-field">
                <dt>Username</dt>
                <dd>{profile.uname}</dd>
              </div>
              <div className="profile-field">
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="profile-field">
                <dt>Phone</dt>
                <dd>{profile.phone}</dd>
              </div>
              <div className="profile-field">
                <dt>Member since</dt>
                <dd>{formatDate(profile.createdAt)}</dd>
              </div>
              <div className="profile-field">
                <dt>Watchlist</dt>
                <dd>{profile.watchlistCount} {profile.watchlistCount === 1 ? 'title' : 'titles'} saved</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
