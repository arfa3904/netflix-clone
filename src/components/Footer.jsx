import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-brand">
          Cine<span className="navbar-logo-accent">Vault</span>
        </p>
        <p className="footer-note">
          Portfolio project built with React, Vite, and the TMDB API. Not affiliated with any streaming service.
        </p>
        <p className="footer-credit">
          Movie data provided by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
            The Movie Database (TMDB)
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
