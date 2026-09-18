import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn, userName, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/app/login');
  };

  return (
    <nav className="navbar-container">
      <div className="container nav-content">
        <Link to="/" className="brand-logo" id="app-logo">
          <span className="logo-icon"><i className="bi bi-gift-fill"></i></span>
          <span className="logo-text">Gift<span>Link</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-item" id="nav-home">Home</Link>
          <Link to="/app" className="nav-item" id="nav-gifts">Gifts</Link>
          <Link to="/app/search" className="nav-item" id="nav-search">Search</Link>
          <Link to="/app/add-gift" className="nav-item donate-link" id="nav-donate">
            <i className="bi bi-plus-circle-fill"></i> Donate Item
          </Link>
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <Link to="/app/profile" className="profile-link" id="nav-profile">
                <i className="bi bi-person-circle"></i>
                <span>{userName || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout" id="logout-btn">
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/app/login" className="btn-login" id="nav-login">Login</Link>
              <Link to="/app/register" className="btn-register" id="nav-register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
