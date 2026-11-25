import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../../services/api';
import Swal from 'sweetalert2';
import { FaImages, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ManageGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Campus');
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gallery');
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to fetch campus gallery items from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const openAddModal = () => {
    setImageFile(null);
    setTitle('');
    setCategory('Campus');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      Swal.fire('Invalid File', 'Only JPG, JPEG, PNG, and WEBP images are allowed.', 'error');
      e.target.value = '';
      setImageFile(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      Swal.fire('File Too Large', 'Image size must not exceed 5MB.', 'error');
      e.target.value = '';
      setImageFile(null);
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!imageFile) {
      Swal.fire('Error', 'Please select a valid image file to upload.', 'error');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title.trim() || 'Campus Photograph');
    formData.append('category', category || 'General');

    try {
      await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire({ icon: 'success', title: 'Image Uploaded', text: 'Campus photo uploaded successfully!', timer: 1500 });
      setShowModal(false);
      fetchGallery();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.response?.data?.message || 'Failed to upload photo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, imgTitle) => {
    Swal.fire({
      title: 'Delete Photo?',
      text: `Are you sure you want to remove "${imgTitle || 'this photograph'}" from the gallery?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8E1616',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete photo!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/gallery/${id}`);
          Swal.fire('Deleted!', 'Image removed from gallery.', 'success');
          fetchGallery();
        } catch (err) {
          Swal.fire('Error!', err.response?.data?.message || 'Failed to delete photo.', 'error');
        }
      }
    });
  };

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <Link to="/admin/dashboard" className="text-navy fw-semibold small d-inline-flex align-items-center">
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </Link>
          <button type="button" onClick={openAddModal} className="btn btn-primary-custom d-flex align-items-center">
            <FaPlus className="me-2" /> Upload Campus Photo
          </button>
        </div>

        <div className="card-custom p-4 shadow-sm border-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 border-bottom pb-3">
            <h3 className="font-heading text-navy fw-bold mb-0">
              <FaImages className="me-2 text-gold" /> Manage Campus Gallery
            </h3>
            <span className="badge bg-navy">{gallery.length} Uploaded Photos</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading gallery...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchGallery}>Retry</button>
            </div>
          ) : gallery.length === 0 ? (
            <div className="alert alert-info text-center py-4">No gallery photographs uploaded. Click &quot;Upload Campus Photo&quot; to add images.</div>
          ) : (
            <div className="row g-4">
              {gallery.map((g) => (
                <div key={g.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-slate-200 shadow-sm overflow-hidden">
                    <img
                      src={getAssetUrl(g.image_path)}
                      alt={g.title || 'Campus Photo'}
                      style={{ height: '220px', objectFit: 'cover' }}
                      className="w-100"
                    />
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <span className="badge bg-danger mb-2">{g.category || 'General'}</span>
                        <h6 className="font-heading fw-bold text-navy mb-1">{g.title || 'Campus Photograph'}</h6>
                      </div>
                      <div className="mt-3 text-end">
                        <button type="button" onClick={() => handleDelete(g.id, g.title)} className="btn btn-sm btn-danger w-100">
                          <FaTrash className="me-1" /> Delete Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-navy text-white">
                <h5 className="modal-title font-heading fw-bold">Upload Campus Photo</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Image File *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      required
                    />
                    <small className="text-muted">Allowed formats: JPG, JPEG, PNG, WEBP. Max size: 5MB.</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Photo Title / Caption</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Main Building Front View"
                      maxLength={200}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Photo Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Campus">Campus Building &amp; Lawns</option>
                      <option value="Infrastructure">Academic Infrastructure</option>
                      <option value="Events">College Events</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Upload Image'}
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

export default ManageGallery;
