import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../services/api';
import buildingHeroImg from '../assets/building_front.jpg';
import buildingLawnImg from '../assets/building_lawn.jpg';
import chairmanImg from '../assets/Rama Kishore Singh.jpeg';
import principalImg from '../assets/principal.jpeg';
import { FaGraduationCap, FaBullhorn, FaDownload, FaArrowRight, FaUniversity, FaBuilding, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Home = () => {
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [noticesRes, coursesRes] = await Promise.all([
        api.get('/notices'),
        api.get('/courses')
      ]);
      setNotices(Array.isArray(noticesRes.data) ? noticesRes.data.slice(0, 4) : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data.slice(0, 6) : []);
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setError('Unable to load latest courses and notices from the server right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ backgroundImage: `url(${buildingHeroImg})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="row">
            <div className="col-lg-10">
              <span className="hero-tag">
                Official Degree College
              </span>
              <h1 className="hero-title">
                RAMA KISHORE SINGH DEGREE COLLEGE
              </h1>
              <p className="hero-meta">
                Affiliated to <strong>B.R.A. Bihar University, Muzaffarpur</strong> &amp; Approved by <strong>Government of Bihar</strong>.<br />
                Dedicated to academic discipline, ethical values, and higher education in Vaishali, Bihar.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/courses" className="btn btn-primary-custom d-flex align-items-center justify-content-center">
                  <FaGraduationCap className="me-2 fs-5" /> Explore Courses
                </Link>
                <Link to="/notices" className="btn btn-outline-custom d-flex align-items-center justify-content-center">
                  <FaBullhorn className="me-2 fs-5" /> View Notice Board
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Introduction Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <div className="pe-lg-4">
                <span className="text-primary-custom font-semibold text-uppercase tracking-wider small">Institutional Profile</span>
                <h2 className="section-title text-start mb-4">Welcome to Rama Kishore Singh Degree College</h2>
                <p className="text-slate-600 mb-3">
                  Rama Kishore Singh Degree College is a premier institution of higher learning situated at Bihjadi, Sahdei Buzurg in the historic district of Vaishali, Bihar established in 2025.
                </p>
                <p className="text-slate-600 mb-4">
                  Affiliated to B.R.A. Bihar University, Muzaffarpur and approved by the Government of Bihar, the college offers degree programs in Arts (B.A., B.A. Hons), Science (B.Sc., B.Sc. Hons), and Commerce (B.Com, B.Com Hons).
                </p>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border border-slate-200">
                      <FaUniversity className="text-primary-custom fs-3 mb-2" />
                      <h6 className="fw-bold mb-1">University Affiliation</h6>
                      <small className="text-muted">B.R.A. Bihar University, Muzaffarpur</small>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border border-slate-200">
                      <FaBuilding className="text-navy fs-3 mb-2" />
                      <h6 className="fw-bold mb-1">State Approval</h6>
                      <small className="text-muted">Approved by Government of Bihar</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img src={buildingLawnImg} alt="Rama Kishore Singh Degree College Lawn and Building" className="img-fluid rounded-lg shadow-lg" />
                <div className="position-absolute bottom-0 end-0 bg-navy text-white p-3 rounded-start shadow d-none d-sm-block">
                  <h6 className="mb-0 text-gold fw-bold">Spacious Campus</h6>
                  <small>Sahdei Buzurg, Vaishali</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chairman & Principal Preview Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">College Leadership</h2>
            <p className="section-subtitle">Guided by experienced educational and public leadership</p>
          </div>
          <div className="row justify-content-center g-4">
            {/* Chairman */}
            <div className="col-md-5 col-lg-4">
              <div className="profile-card">
                <div className="profile-avatar-wrapper d-flex align-items-center justify-content-center bg-navy text-white fw-bold fs-2">
                  <img className="chair_man" src={chairmanImg} alt="Shri Rama Kishore Singh" />
                </div>
                <h4 className="profile-name">Shri Rama Kishore Singh</h4>
                <div className="profile-designation">Chairman</div>
                <div className="profile-qual">Former MP</div>
                <p className="small text-muted mt-3 mb-0">
                  Providing vision and institutional guidance for qualitative academic development.
                </p>
              </div>
            </div>

            {/* Principal */}
            <div className="col-md-5 col-lg-4">
              <div className="profile-card">
                <div className="profile-avatar-wrapper d-flex align-items-center justify-content-center bg-primary text-white fw-bold fs-2">
                  <img className="principal" src={principalImg} alt="Mr. Kishore Kunal" />
                </div>
                <h4 className="profile-name">Mr. Kishore Kunal</h4>
                <div className="profile-designation">Principal</div>
                <div className="profile-qual">M.A., M.Ed., Ph.D.</div>
                <p className="small text-muted mt-3 mb-0">
                  Leading academic administration and student welfare initiatives across departments.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/leadership" className="btn btn-outline-dark btn-sm rounded-pill px-4">
              View Detailed Profiles <FaArrowRight className="ms-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Academic Degree Programs</h2>
            <p className="section-subtitle">Undergraduate Degree Programs Affiliated to B.R.A. Bihar University</p>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading courses...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-warning text-center d-flex flex-column align-items-center gap-2">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={fetchData}>Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="alert alert-info text-center">No degree courses listed currently.</div>
          ) : (
            <div className="row g-4">
              {courses.map((course) => (
                <div key={course.id} className="col-md-6 col-lg-4">
                  <div className="card-custom course-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                      <h4 className="font-heading text-navy fw-bold mb-0">{course.name}</h4>
                      <span className="course-badge flex-shrink-0">{course.duration || '3 Years'}</span>
                    </div>
                    <p className="small text-muted mb-3">
                      {course.description || 'Undergraduate degree program following university curriculum.'}
                    </p>
                    {course.eligibility && (
                      <div className="small text-slate-700 bg-light p-2 rounded mb-3">
                        <strong>Eligibility:</strong> {course.eligibility}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/courses" className="btn btn-primary-custom">
              View All Courses &amp; Regulations <FaArrowRight className="ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Notices Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <span className="text-primary-custom font-semibold text-uppercase small">Official Communications</span>
              <h2 className="font-heading text-navy fw-bold mb-0">Notice Board &amp; Announcements</h2>
            </div>
            <Link to="/notices" className="btn btn-outline-dark btn-sm rounded-pill px-4 mt-2 mt-sm-0">
              View All Notices <FaArrowRight className="ms-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading notices...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-warning text-center">{error}</div>
          ) : notices.length === 0 ? (
            <div className="alert alert-info text-center">No official notices posted currently.</div>
          ) : (
            <div className="row g-3">
              {notices.map((notice) => (
                <div key={notice.id} className="col-lg-6">
                  <div className="notice-item h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="notice-date">{notice.notice_date}</span>
                        <small className="text-muted">Official Notice</small>
                      </div>
                      <h5 className="font-heading text-navy fw-bold mb-2">{notice.title}</h5>
                      {notice.description && (
                        <p className="text-slate-600 small mb-3">
                          {notice.description.length > 140 ? `${notice.description.substring(0, 140)}...` : notice.description}
                        </p>
                      )}
                    </div>
                    <div>
                      {notice.pdf_path ? (
                        <a
                          href={getAssetUrl(notice.pdf_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                        >
                          <FaDownload className="me-2" /> Download PDF Notice
                        </a>
                      ) : (
                        <Link to={`/notices/${notice.id}`} className="btn btn-sm btn-link text-primary-custom p-0 fw-bold">
                          Read Notice Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Contact & Location Summary */}
      <section className="py-5 bg-navy text-white">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6">
              <h3 className="text-gold font-heading mb-3">Visit College Campus</h3>
              <h4 className="text-white mb-3">Rama Kishore Singh Degree College</h4>
              <p className="text-slate-300 mb-4">
                Bihjadi, Kumharkol Buzurg, Sahdei Buzurg, District: Vaishali - 844509, Bihar, India.
              </p>
              <div className="d-flex flex-column gap-2 mb-4">
                <div><FaPhoneAlt className="text-gold me-2" /> <strong>Reception:</strong> 7320906311</div>
                <div><FaPhoneAlt className="text-gold me-2" /> <strong>Office:</strong> 7549689001</div>
                <div><FaPhoneAlt className="text-gold me-2" /> <strong>Principal:</strong> 8882737505</div>
                <div><FaEnvelope className="text-gold me-2" /> <strong>Email:</strong> ramakishoresinghdegreecollege@gmail.com</div>
              </div>
              <Link to="/contact" className="btn btn-primary-custom">
                Full Contact &amp; Directions
              </Link>
            </div>
            <div className="col-lg-6">
              <div className="p-3 bg-white text-dark rounded shadow-lg">
                <h5 className="font-heading text-navy fw-bold mb-2">Location Map</h5>
                <p className="small text-muted mb-3">Sahdei Buzurg, Vaishali, Bihar 844509</p>
                <div className="ratio ratio-16x9 rounded overflow-hidden">
                  <iframe
                    title="Rama Kishore Singh Degree College Location"
                    src="https://maps.google.com/maps?q=Bihjadi%20Sahdei%20Buzurg%20Vaishali%20Bihar&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
