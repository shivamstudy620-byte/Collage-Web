import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { FaCheckCircle, FaUniversity } from 'react-icons/fa';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/courses')
      .then((res) => {
        setCourses(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setError('Unable to load course catalog right now. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div>
      {/* Banner */}
      <section className="bg-navy text-white py-5">
        <div className="container py-3">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Academic Programs</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">Degree Courses Offered</h1>
          <p className="lead text-slate-300 mb-0">
            Undergraduate Courses Affiliated to B.R.A. Bihar University, Muzaffarpur
          </p>
        </div>
      </section>

      {/* Courses List */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="alert alert-warning border-gold mb-5 shadow-sm d-flex align-items-center">
            <FaUniversity className="fs-3 text-navy me-3 flex-shrink-0" />
            <div>
              <strong className="text-navy">University Affiliation Note:</strong> All degree courses offered at Rama Kishore Singh Degree College follow the academic curriculum, examination schedule, and syllabus prescribed by <strong>B.R.A. Bihar University, Muzaffarpur</strong>.
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading courses...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center d-flex flex-column align-items-center gap-2 py-4">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchCourses}>Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="alert alert-info text-center">No course programs listed currently.</div>
          ) : (
            <div className="row g-4">
              {courses.map((course) => (
                <div key={course.id} className="col-md-6 col-lg-4">
                  <div className="card-custom p-4 h-100 border-top border-4 border-danger shadow-sm d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                      <div>
                        <span className="badge bg-navy mb-2">Undergraduate Degree</span>
                        <h3 className="font-heading text-navy fw-bold mb-0">{course.name}</h3>
                      </div>
                      <span className="badge bg-light text-navy border border-slate-300 py-2 px-3 flex-shrink-0">
                        {course.duration || '3 Years Degree'}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-4 small leading-relaxed">
                      {course.description || 'Bachelor degree program conducted under university academic regulations.'}
                    </p>

                    {course.eligibility && (
                      <div className="bg-light p-3 rounded border border-slate-200 mt-auto">
                        <div className="d-flex align-items-center text-primary-custom fw-semibold mb-1 small">
                          <FaCheckCircle className="me-2" /> Eligibility Criteria
                        </div>
                        <p className="small text-slate-700 mb-0">
                          {course.eligibility}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;
