import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Debounced sync of the search box into the ?q= URL param that Home reads.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const trimmed = searchValue.trim();
        if (trimmed) next.set('q', trimmed);
        else next.delete('q');
        return next;
      }, { replace: true });
    }, 350);
    return () => clearTimeout(handle);
  }, [searchValue, setSearchParams]);

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

  return (
    <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <a href="#top" className="navbar-logo">
            Cine<span className="navbar-logo-accent">Vault</span>
          </a>
          <div className="navbar-menu">
            <a href="#top" className="navbar-link">Home</a>
            <a href="#trending" className="navbar-link">Trending</a>
            <a href="#popular" className="navbar-link">Popular</a>
            <a href="#top-rated" className="navbar-link">Top Rated</a>
          </div>
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
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-label="Account menu"
            >
              {initial}
            </button>
            {userMenuOpen && (
              <div className="navbar-user-dropdown" role="menu">
                <div className="navbar-user-info">
                  <p className="navbar-user-name">{user?.uname}</p>
                  <p className="navbar-user-email">{user?.email}</p>
                </div>
                <button
                  type="button"
                  className="navbar-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  role="menuitem"
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
          <a href="#top" className="navbar-link" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#trending" className="navbar-link" onClick={() => setMobileOpen(false)}>Trending</a>
          <a href="#popular" className="navbar-link" onClick={() => setMobileOpen(false)}>Popular</a>
          <a href="#top-rated" className="navbar-link" onClick={() => setMobileOpen(false)}>Top Rated</a>
          <button type="button" className="navbar-logout navbar-logout--mobile" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      )}
    </nav>
  );
}
