import React, { useContext, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { FaUserShield, FaTachometerAlt } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const collapseRef = useRef(null);

  const closeMobileMenu = () => {
    const el = collapseRef.current;
    if (el && el.classList.contains('show')) {
      el.classList.remove('show');
    }
  };

  return (
    <nav className="navbar navbar-expand-xl main-navbar" aria-label="Main Navigation">
      <div className="container cus-container">
        <Link className="navbar-brand d-flex align-items-center me-4" to="/" onClick={closeMobileMenu}>
          <img src={logoImg} alt="Rama Kishore Singh Degree College Logo" className="college-logo-img me-3" />
          <div className="d-flex flex-column">
            <span className="brand-title">RAMA KISHORE SINGH DEGREE COLLEGE</span>
            <span className="brand-subtitle">Bihjadi, Sahdei Buzurg, Vaishali, Bihar - 844509</span>
          </div>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#rksdNavbar"
          aria-controls="rksdNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="rksdNavbar" ref={collapseRef}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/" end onClick={closeMobileMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/about" onClick={closeMobileMenu}>
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/leadership" onClick={closeMobileMenu}>
                Chairman &amp; Principal
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/courses" onClick={closeMobileMenu}>
                Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/notices" onClick={closeMobileMenu}>
                Notices
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/gallery" onClick={closeMobileMenu}>
                Gallery
              </NavLink>
            </li>
            <li className="nav-item me-lg-3">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/contact" onClick={closeMobileMenu}>
                Contact
              </NavLink>
            </li>
            <li className="nav-item mt-2 mt-lg-0">
              {isAuthenticated ? (
                <Link to="/admin/dashboard" className="btn nav-admin-btn d-flex align-items-center justify-content-center" onClick={closeMobileMenu}>
                  <FaTachometerAlt className="me-2" /> Admin Portal
                </Link>
              ) : (
                <Link to="/admin/login" className="btn nav-admin-btn d-flex align-items-center justify-content-center" onClick={closeMobileMenu}>
                  <FaUserShield className="me-2" /> Admin Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
