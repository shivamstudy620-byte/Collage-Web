import React, { useState, useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username: cleanUsername, password });
      login(res.data.token, res.data.admin);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card-custom p-4 p-sm-5 shadow-lg border-top border-5 border-danger">
          <div className="text-center mb-4">
            <img
              src={logoImg}
              alt="Rama Kishore Singh Degree College Logo"
              style={{ height: '75px' }}
              className="mb-3"
            />
            <h3 className="font-heading text-navy fw-bold mb-1">Administrative Login</h3>
            <p className="small text-muted mb-0">Rama Kishore Singh Degree College Management Portal</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-4 text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="admin-username" className="form-label font-semibold text-slate-700 small">Administrator Username</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><FaUser className="text-muted" /></span>
                <input
                  id="admin-username"
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="admin-password" className="form-label font-semibold text-slate-700 small">Security Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><FaLock className="text-muted" /></span>
                <input
                  id="admin-password"
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              ) : (
                <FaSignInAlt className="me-2" />
              )}
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/" className="text-muted small d-inline-flex align-items-center">
              <FaArrowLeft className="me-1" /> Return to College Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
