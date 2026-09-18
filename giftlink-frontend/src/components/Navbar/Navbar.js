import React, { useState, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn, userName, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/app/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="container nav-content">
        <Link to="/" className="brand-logo" id="app-logo" onClick={closeMobileMenu}>
          <span className="logo-icon"><i className="bi bi-gift-fill"></i></span>
          <span className="logo-text">Gift<span>Link</span></span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>

        {/* Desktop & Mobile Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-home"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-house-door-fill nav-icon-prefix"></i> Home
          </NavLink>

          <NavLink
            to="/app"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-gifts"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-grid-fill nav-icon-prefix"></i> Gifts
          </NavLink>

          <NavLink
            to="/app/search"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-search"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-search nav-icon-prefix"></i> Search
          </NavLink>

          <NavLink
            to="/app/add-gift"
            className={({ isActive }) => `nav-item donate-link ${isActive ? 'active' : ''}`}
            id="nav-donate"
            onClick={closeMobileMenu}
          >
            <i className="bi bi-plus-circle-fill"></i> Donate Item
          </NavLink>

          {/* Mobile Auth Items in Menu */}
          <div className="mobile-auth-section">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/app/profile"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-person-circle"></i> {userName || 'Profile'}
                </NavLink>
                <button onClick={handleLogout} className="btn-logout-mobile">
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/app/login" className="btn-login-mobile" onClick={closeMobileMenu}>Login</Link>
                <Link to="/app/register" className="btn-register-mobile" onClick={closeMobileMenu}>Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop User Menu / Auth Buttons */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <NavLink
                to="/app/profile"
                className={({ isActive }) => `profile-link ${isActive ? 'active' : ''}`}
                id="nav-profile"
              >
                <i className="bi bi-person-circle"></i>
                <span>{userName || 'Profile'}</span>
              </NavLink>
              <button onClick={handleLogout} className="btn-logout" id="logout-btn">
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <NavLink
                to="/app/login"
                className={({ isActive }) => `btn-login ${isActive ? 'active' : ''}`}
                id="nav-login"
              >
                Login
              </NavLink>
              <NavLink
                to="/app/register"
                className="btn-register"
                id="nav-register"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

