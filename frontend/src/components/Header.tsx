import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L4 8V16C4 23.732 9.373 28 16 30C22.627 28 28 23.732 28 16V8L16 2Z"
                fill="url(#logo-gradient)"
              />
              <defs>
                <linearGradient id="logo-gradient" x1="4" y1="2" x2="28" y2="30">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="50%" stopColor="#c44569" />
                  <stop offset="100%" stopColor="#ff6b9d" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text gradient-text">Aurora Blog</span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-link-text">首页</span>
            <span className="nav-link-indicator"></span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/write"
                className={`nav-link ${isActive('/write') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-link-text">写文章</span>
                <span className="nav-link-indicator"></span>
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-link-text">{user?.username}</span>
                <span className="nav-link-indicator"></span>
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-link-text">登录</span>
                <span className="nav-link-indicator"></span>
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                注册
              </Link>
            </>
          )}
        </nav>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>
  );
}
