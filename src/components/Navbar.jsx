import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/watchlist', label: 'My List' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(location.pathname === '/' ? searchParams.get('q') || '' : '');
  const userMenuRef = useRef(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Debounced sync of the search box: on the home route it updates ?q= in
  // place; from anywhere else, searching navigates to home with the query
  // so search works app-wide, not just from the home page.
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchValue.trim();
      if (isHome) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (trimmed) next.set('q', trimmed);
            else next.delete('q');
            return next;
          },
          { replace: true }
        );
      } else if (trimmed) {
        navigate(`/?q=${encodeURIComponent(trimmed)}`);
      }
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, isHome]);

  useEffect(() => {
    function onClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  const initial = (user?.uname || user?.email || '?').trim().charAt(0).toUpperCase();

  function renderNavLinks(onNavigate) {
    return NAV_LINKS.map(({ to, label }) => {
      const active = location.pathname === to;
      return (
        <Link
          key={to}
          to={to}
          className="navbar-link"
          aria-current={active ? 'page' : undefined}
          data-active={active || undefined}
          onClick={onNavigate}
        >
          {label}
        </Link>
      );
    });
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            Cine<span className="navbar-logo-accent">Vault</span>
          </Link>
          <div className="navbar-menu">{renderNavLinks()}</div>
        </div>

        <div className="navbar-right">
          <form className="navbar-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <span className="navbar-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Search movies…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Search movies"
            />
          </form>

          <div className="navbar-user" ref={userMenuRef}>
            <button
              type="button"
              className="navbar-avatar"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              aria-label="Account menu"
            >
              {initial}
            </button>
            {userMenuOpen && (
              // A simple disclosure panel, not a full ARIA "menu" widget — this
              // intentionally doesn't claim role="menu"/"menuitem", since it
              // doesn't implement the arrow-key navigation that role requires.
              <div className="navbar-user-dropdown">
                <div className="navbar-user-info">
                  <p className="navbar-user-name">{user?.uname}</p>
                  <p className="navbar-user-email">{user?.email}</p>
                </div>
                <Link to="/profile" className="navbar-dropdown-link" onClick={() => setUserMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  type="button"
                  className="navbar-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Signing out…' : 'Log out'}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="navbar-burger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-panel">
          <form className="navbar-search navbar-search--mobile" role="search" onSubmit={(e) => e.preventDefault()}>
            <span className="navbar-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Search movies…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Search movies"
            />
          </form>
          {renderNavLinks(() => setMobileOpen(false))}
          <Link to="/profile" className="navbar-link" onClick={() => setMobileOpen(false)}>
            Profile
          </Link>
          <button type="button" className="navbar-logout navbar-logout--mobile" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      )}
    </nav>
  );
}
