import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredUser } from '../services/auth';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    clearStoredUser();
    navigate('/login', { replace: true });
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar-container">
        <span className="navbar-logo">NETFLIX</span>
        <div className="navbar-menu">
          <a href="#home" className="navbar-link">Home</a>
          <a href="#trending" className="navbar-link">Trending</a>
          <a href="#popular" className="navbar-link">Popular</a>
          <a href="#top-rated" className="navbar-link">Top Rated</a>
          <button type="button" className="navbar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
