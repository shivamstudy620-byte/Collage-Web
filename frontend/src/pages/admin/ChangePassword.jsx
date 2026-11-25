import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { FaKey, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';

const ChangePassword = () => {
  const { updateToken } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire('Error', 'Please fill in all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'New password and confirm password do not match.', 'error');
      return;
    }

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      Swal.fire(
        'Weak Password',
        'New password must be at least 8 characters long and contain both letters and numbers.',
        'error'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/change-password', { oldPassword, newPassword });
      if (res.data?.token) {
        updateToken(res.data.token);
      }
      Swal.fire({
        icon: 'success',
        title: 'Password Updated',
        text: 'Your security password has been updated and prior sessions invalidated.',
        timer: 2000
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="mb-4">
          <Link to="/admin/dashboard" className="text-navy fw-semibold small d-inline-flex align-items-center">
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </Link>
        </div>

        <div className="card-custom p-4 p-sm-5 shadow-sm border-top border-4 border-navy">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 bg-light rounded-circle text-navy fs-2 mb-2">
              <FaKey />
            </div>
            <h3 className="font-heading text-navy fw-bold mb-1">Change Security Password</h3>
            <p className="small text-muted mb-0">Update administrator portal access password</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="current-password" className="form-label fw-semibold small">Current Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><FaLock className="text-muted" /></span>
                <input
                  id="current-password"
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="new-password" className="form-label fw-semibold small">New Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><FaKey className="text-muted" /></span>
                <input
                  id="new-password"
                  type="password"
                  className="form-control"
                  placeholder="Min. 8 chars with letters & numbers"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirm-password" className="form-label fw-semibold small">Confirm New Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><FaCheck className="text-muted" /></span>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <FaKey className="me-2" />
              )}
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
