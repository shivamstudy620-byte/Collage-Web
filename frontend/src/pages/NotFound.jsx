import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaBullhorn, FaGraduationCap } from 'react-icons/fa';

const NotFound = () => {
  return (
    <section className="py-5 bg-light min-vh-75 d-flex align-items-center">
      <div className="container py-5 text-center">
        <div className="card-custom p-5 mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
          <div className="d-inline-flex p-3 bg-light rounded-circle text-primary-custom fs-1 mb-3">
            <FaExclamationTriangle />
          </div>
          <h1 className="display-4 font-heading fw-bold text-navy mb-2">404</h1>
          <h2 className="h4 font-heading text-navy fw-bold mb-3">Page Not Found</h2>
          <p className="text-slate-600 mb-4">
            The page you are looking for does not exist or may have been moved. Please use the links below to navigate Rama Kishore Singh Degree College portal.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/" className="btn btn-primary-custom d-inline-flex align-items-center">
              <FaHome className="me-2" /> Back to Home
            </Link>
            <Link to="/courses" className="btn btn-outline-dark rounded-pill px-4 d-inline-flex align-items-center">
              <FaGraduationCap className="me-2" /> Courses
            </Link>
            <Link to="/notices" className="btn btn-outline-dark rounded-pill px-4 d-inline-flex align-items-center">
              <FaBullhorn className="me-2" /> Notices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
