import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaBullhorn, FaGraduationCap, FaImages, FaKey, FaSignOutAlt, FaExternalLinkAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    noticesCount: 0,
    coursesCount: 0,
    galleryCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [noticesRes, coursesRes, galleryRes] = await Promise.all([
        api.get('/notices'),
        api.get('/courses'),
        api.get('/gallery')
      ]);
      setStats({
        noticesCount: Array.isArray(noticesRes.data) ? noticesRes.data.length : 0,
        coursesCount: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0,
        galleryCount: Array.isArray(galleryRes.data) ? galleryRes.data.length : 0
      });
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Failed to load dashboard statistics from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        {/* Admin Header Bar */}
        <div className="bg-navy text-white p-4 rounded-lg shadow-sm mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="badge bg-danger px-3 py-1 mb-2">Content Management Panel</span>
            <h2 className="font-heading text-white fw-bold mb-0">Welcome, {admin?.username || 'Administrator'}</h2>
            <small className="text-slate-300">Rama Kishore Singh Degree College Admin Portal</small>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm d-flex align-items-center">
              <FaExternalLinkAlt className="me-1" /> View Public Site
            </Link>
            <button type="button" onClick={handleLogout} className="btn btn-danger btn-sm d-flex align-items-center">
              <FaSignOutAlt className="me-1" /> Logout
            </button>
          </div>
        </div>

        {/* Quick Summary Stat Cards */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading statistics...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <span>{error}</span>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchStats}>Retry</button>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold">ACTIVE NOTICES</span>
                    <div className="stat-number">{stats.noticesCount}</div>
                  </div>
                  <FaBullhorn className="fs-1 text-primary-custom opacity-50" />
                </div>
                <div className="mt-3">
                  <Link to="/admin/notices" className="text-primary-custom font-semibold small">
                    Manage Notices →
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card" style={{ borderLeftColor: 'var(--color-navy)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold">DEGREE COURSES</span>
                    <div className="stat-number">{stats.coursesCount}</div>
                  </div>
                  <FaGraduationCap className="fs-1 text-navy opacity-50" />
                </div>
                <div className="mt-3">
                  <Link to="/admin/courses" className="text-navy font-semibold small">
                    Manage Programs →
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card" style={{ borderLeftColor: 'var(--color-gold)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold">GALLERY PHOTOS</span>
                    <div className="stat-number">{stats.galleryCount}</div>
                  </div>
                  <FaImages className="fs-1 text-gold opacity-50" />
                </div>
                <div className="mt-3">
                  <Link to="/admin/gallery" className="text-gold font-semibold small">
                    Manage Gallery →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Navigation Grid */}
        <h4 className="font-heading text-navy fw-bold mb-3">Management Modules</h4>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <Link to="/admin/notices" className="card-custom p-4 text-center d-block hover-lift">
              <FaBullhorn className="fs-1 text-danger mb-3" />
              <h5 className="font-heading text-navy fw-bold mb-1">Notices &amp; PDFs</h5>
              <p className="small text-muted mb-0">Publish notice announcements and attach circular PDFs</p>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/courses" className="card-custom p-4 text-center d-block hover-lift">
              <FaGraduationCap className="fs-1 text-navy mb-3" />
              <h5 className="font-heading text-navy fw-bold mb-1">Course Catalog</h5>
              <p className="small text-muted mb-0">Add or edit B.A., B.Sc., B.Com degree programs</p>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/gallery" className="card-custom p-4 text-center d-block hover-lift">
              <FaImages className="fs-1 text-gold mb-3" />
              <h5 className="font-heading text-navy fw-bold mb-1">Campus Gallery</h5>
              <p className="small text-muted mb-0">Upload or remove campus photographs</p>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/change-password" className="card-custom p-4 text-center d-block hover-lift">
              <FaKey className="fs-1 text-dark mb-3" />
              <h5 className="font-heading text-navy fw-bold mb-1">Change Password</h5>
              <p className="small text-muted mb-0">Update admin login security credentials</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
