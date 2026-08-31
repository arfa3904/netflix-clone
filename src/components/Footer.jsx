import './Footer.css';

const STACK = ['React', 'Vite', 'React Router', 'Node.js', 'MySQL', 'JWT', 'TMDB API'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <p className="footer-brand">
            Cine<span className="navbar-logo-accent">Vault</span>
          </p>
          <a
            className="footer-github"
            href="https://github.com/arfa3904/netflix-clone"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub ↗
          </a>
        </div>

        <ul className="footer-stack" aria-label="Technology stack">
          {STACK.map((tech) => (
            <li key={tech} className="footer-stack-item">
              {tech}
            </li>
          ))}
        </ul>

        <p className="footer-note">
          A full-stack movie discovery platform — real authentication, a MySQL-backed watchlist, and live TMDB
          data behind a server-side proxy. Portfolio project, not affiliated with any streaming service.
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
