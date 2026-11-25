import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../../services/api';
import Swal from 'sweetalert2';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [removePdf, setRemovePdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/notices');
      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to fetch notices from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openAddModal = () => {
    setEditingNotice(null);
    setTitle('');
    setDescription('');
    setNoticeDate(new Date().toISOString().split('T')[0]);
    setPdfFile(null);
    setRemovePdf(false);
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setDescription(notice.description || '');
    setNoticeDate(notice.notice_date);
    setPdfFile(null);
    setRemovePdf(false);
    setShowModal(true);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      Swal.fire('Invalid File', 'Only PDF documents (.pdf) are allowed.', 'error');
      e.target.value = '';
      setPdfFile(null);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      Swal.fire('File Too Large', 'PDF file size must not exceed 10MB.', 'error');
      e.target.value = '';
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
    setRemovePdf(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Swal.fire('Validation Error', 'Notice title is required.', 'error');
      return;
    }
    if (!noticeDate) {
      Swal.fire('Validation Error', 'Publication date is required.', 'error');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', cleanTitle);
    formData.append('description', description.trim());
    formData.append('notice_date', noticeDate);
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    } else if (editingNotice && removePdf) {
      formData.append('remove_pdf', 'true');
    }

    try {
      if (editingNotice) {
        await api.put(`/notices/${editingNotice.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({ icon: 'success', title: 'Notice Updated', text: 'Notice updated successfully!', timer: 1500 });
      } else {
        await api.post('/notices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({ icon: 'success', title: 'Notice Created', text: 'New notice published successfully!', timer: 1500 });
      }
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Failed to save notice.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, noticeTitle) => {
    Swal.fire({
      title: 'Delete Notice?',
      text: `Are you sure you want to delete "${noticeTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8E1616',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete notice!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/notices/${id}`);
          Swal.fire('Deleted!', 'Notice has been removed.', 'success');
          fetchNotices();
        } catch (err) {
          Swal.fire('Error!', err.response?.data?.message || 'Failed to delete notice.', 'error');
        }
      }
    });
  };

  return (
    <div className="py-3 py-md-4 bg-light min-vh-100 admin-manage-section admin-notices-section">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="admin-manage-topbar d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 mb-md-4">
          <Link to="/admin/dashboard" className="admin-back-link text-navy fw-semibold small d-inline-flex align-items-center">
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-primary-custom admin-add-btn d-inline-flex align-items-center justify-content-center"
          >
            <FaPlus className="me-2" /> Add New Notice
          </button>
        </div>

        <div className="card-custom admin-manage-card p-4 shadow-sm border-0">
          <div className="admin-manage-header d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 mb-md-4 border-bottom pb-3">
            <h3 className="admin-manage-title font-heading text-navy fw-bold mb-0 d-flex align-items-center">
              <FaBullhorn className="me-2 text-danger flex-shrink-0" />
              <span>Manage Notice Board</span>
            </h3>
            <span className="badge bg-navy admin-count-badge">{notices.length} Notices</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading notices...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2 mb-0">
              <span className="word-break">{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchNotices}>Retry</button>
            </div>
          ) : notices.length === 0 ? (
            <div className="alert alert-info text-center py-4 mb-0">No notices currently published. Click &quot;Add New Notice&quot; to create one.</div>
          ) : (
            <>
              {/* Desktop & Tablet Table View */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0 admin-notices-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Date</th>
                      <th>Notice Title</th>
                      <th>Attached PDF</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((n) => (
                      <tr key={n.id}>
                        <td className="fw-semibold text-nowrap">{n.notice_date}</td>
                        <td>
                          <strong className="text-navy">{n.title}</strong>
                          {n.description && (
                            <div className="small text-muted text-truncate admin-notice-desc">
                              {n.description}
                            </div>
                          )}
                        </td>
                        <td>
                          {n.pdf_path ? (
                            <a href={getAssetUrl(n.pdf_path)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger text-nowrap">
                              <FaFilePdf className="me-1" /> PDF File
                            </a>
                          ) : (
                            <span className="badge bg-light text-muted border">No PDF</span>
                          )}
                        </td>
                        <td className="text-end text-nowrap">
                          <button type="button" onClick={() => openEditModal(n)} className="btn btn-sm btn-outline-primary me-2">
                            <FaEdit className="me-1" /> Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(n.id, n.title)} className="btn btn-sm btn-danger">
                            <FaTrash className="me-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="d-md-none admin-mobile-list">
                {notices.map((n) => (
                  <div key={n.id} className="admin-mobile-item">
                    <div className="admin-mobile-item-meta d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <span className="notice-date">{n.notice_date}</span>
                      {n.pdf_path ? (
                        <a
                          href={getAssetUrl(n.pdf_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger admin-mobile-pdf-btn d-inline-flex align-items-center"
                        >
                          <FaFilePdf className="me-1 flex-shrink-0" /> PDF File
                        </a>
                      ) : (
                        <span className="badge bg-light text-muted border">No PDF</span>
                      )}
                    </div>

                    <h5 className="admin-mobile-item-title text-navy fw-bold mb-1 word-break">{n.title}</h5>
                    {n.description && (
                      <p className="admin-mobile-item-desc small text-muted mb-3 word-break">
                        {n.description}
                      </p>
                    )}

                    <div className="admin-mobile-actions d-flex flex-wrap gap-2 mt-2 pt-2 border-top">
                      <button
                        type="button"
                        onClick={() => openEditModal(n)}
                        className="btn btn-sm btn-outline-primary admin-mobile-action-btn d-inline-flex align-items-center justify-content-center"
                      >
                        <FaEdit className="me-1 flex-shrink-0" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id, n.title)}
                        className="btn btn-sm btn-danger admin-mobile-action-btn d-inline-flex align-items-center justify-content-center"
                      >
                        <FaTrash className="me-1 flex-shrink-0" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block admin-manage-modal" role="dialog" aria-modal="true" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-navy text-white">
                <h5 className="modal-title font-heading fw-bold">
                  {editingNotice ? 'Edit Notice' : 'Publish New Notice'}
                </h5>
                <button type="button" className="btn-close btn-close-white flex-shrink-0" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Notice Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. B.A. Examination Registration Form Notice"
                      maxLength={300}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Publication Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Notice Short Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter detailed notice content or instructions..."
                      maxLength={5000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-3 mb-sm-0">
                    <label className="form-label fw-semibold">Attach Official PDF Document (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfChange}
                    />
                    <small className="text-muted d-block mt-1">Allowed format: PDF only. Max size: 10MB.</small>
                    {editingNotice && editingNotice.pdf_path && !pdfFile && (
                      <div className="mt-2 d-flex flex-wrap align-items-center justify-content-between gap-2 admin-existing-pdf-row">
                        <span className="small text-success word-break">
                          Current file: <a href={getAssetUrl(editingNotice.pdf_path)} target="_blank" rel="noreferrer">Existing PDF File</a>
                        </span>
                        <div className="form-check mb-0">
                          <input
                            id="remove-existing-pdf"
                            type="checkbox"
                            className="form-check-input"
                            checked={removePdf}
                            onChange={(e) => setRemovePdf(e.target.checked)}
                          />
                          <label htmlFor="remove-existing-pdf" className="form-check-label small text-danger">
                            Remove attached PDF
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                    {submitting ? 'Saving...' : editingNotice ? 'Update Notice' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotices;
