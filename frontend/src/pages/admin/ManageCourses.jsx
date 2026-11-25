import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/courses');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch degree courses from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openAddModal = () => {
    setEditingCourse(null);
    setName('');
    setDuration('3 Years Degree Course');
    setEligibility('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    setName(c.name);
    setDuration(c.duration || '');
    setEligibility(c.eligibility || '');
    setDescription(c.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanName = name.trim();
    if (!cleanName) {
      Swal.fire('Validation Error', 'Course name is required.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: cleanName,
      duration: duration.trim() || '3 Years Degree Course',
      eligibility: eligibility.trim(),
      description: description.trim()
    };

    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Course Program Updated', timer: 1500 });
      } else {
        await api.post('/courses', payload);
        Swal.fire({ icon: 'success', title: 'New Course Added', timer: 1500 });
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, courseName) => {
    Swal.fire({
      title: 'Delete Course?',
      text: `Are you sure you want to remove "${courseName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8E1616',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete course!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/courses/${id}`);
          Swal.fire('Deleted!', 'Course program removed.', 'success');
          fetchCourses();
        } catch (err) {
          Swal.fire('Error!', err.response?.data?.message || 'Failed to delete course.', 'error');
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
            <FaPlus className="me-2" /> Add Course Program
          </button>
        </div>

        <div className="card-custom p-4 shadow-sm border-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 border-bottom pb-3">
            <h3 className="font-heading text-navy fw-bold mb-0">
              <FaGraduationCap className="me-2 text-navy" /> Manage Degree Courses
            </h3>
            <span className="badge bg-navy">{courses.length} Degree Programs</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading courses...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchCourses}>Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="alert alert-info text-center py-4">No course programs currently added.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Course Name</th>
                    <th>Duration</th>
                    <th>Eligibility</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold text-navy">{c.name}</td>
                      <td><span className="badge bg-light text-navy border">{c.duration || '3 Years'}</span></td>
                      <td className="small text-slate-700">{c.eligibility || 'N/A'}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" onClick={() => openEditModal(c)} className="btn btn-sm btn-outline-primary me-2">
                          <FaEdit className="me-1" /> Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(c.id, c.name)} className="btn btn-sm btn-danger">
                          <FaTrash className="me-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-navy text-white">
                <h5 className="modal-title font-heading fw-bold">
                  {editingCourse ? 'Edit Degree Course' : 'Add Degree Course Program'}
                </h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Course Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. B.A. Honours"
                      maxLength={150}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Course Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 3 Years Degree Course"
                      maxLength={100}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Eligibility Criteria</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 10+2 Science/Commerce/Arts"
                      maxLength={500}
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Course Program Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Course overview and syllabus highlights..."
                      maxLength={2000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                    {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
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

export default ManageCourses;
