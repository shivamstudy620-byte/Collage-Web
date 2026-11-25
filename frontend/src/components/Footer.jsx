import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGlobe, FaChevronRight } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-dark">
      <div className="container">
        <div className="row gy-4">
          {/* Column 1: College Intro & Logo */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img src={logoImg} alt="Rama Kishore Singh Degree College" style={{ height: '60px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '50%' }} className="me-3" />
              <div>
                <h5 className="text-white mb-0 font-heading">Rama Kishore Singh Degree College</h5>
                <small className="text-light opacity-75">Vaishali, Bihar</small>
              </div>
            </div>
            <p className="text-slate-300 small mb-3">
              Affiliated to B.R.A. Bihar University, Muzaffarpur & Approved by Government of Bihar. Committed to higher academic education in undergraduate Humanities, Science, and Commerce disciplines.
            </p>
            <div className="d-flex align-items-center gap-2 text-gold small">
              <FaGlobe /> <span>rksdcollege.in</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h5 className="footer-heading">Quick Navigation</h5>
            <ul className="footer-links">
              <li><Link to="/"><FaChevronRight className="me-2 text-primary-custom" /> Home</Link></li>
              <li><Link to="/about"><FaChevronRight className="me-2 text-primary-custom" /> About Institution</Link></li>
              <li><Link to="/leadership"><FaChevronRight className="me-2 text-primary-custom" /> Chairman & Principal</Link></li>
              <li><Link to="/courses"><FaChevronRight className="me-2 text-primary-custom" /> Academic Courses</Link></li>
              <li><Link to="/notices"><FaChevronRight className="me-2 text-primary-custom" /> Notice Board</Link></li>
              <li><Link to="/gallery"><FaChevronRight className="me-2 text-primary-custom" /> Campus Gallery</Link></li>
              <li><Link to="/contact"><FaChevronRight className="me-2 text-primary-custom" /> Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div className="col-lg-5 col-md-12">
            <h5 className="footer-heading">Official Contact Details</h5>
            <ul className="list-unstyled text-slate-300 small mb-0">
              <li className="d-flex mb-3">
                <FaMapMarkerAlt className="text-gold me-3 mt-1 fs-5 flex-shrink-0" />
                <span>
                  <strong>Address:</strong><br />
                  Bihjadi, Kumharkol Buzurg, Sahdei Buzurg,<br />
                  District: Vaishali - 844509, Bihar, India
                </span>
              </li>
              <li className="d-flex mb-3">
                <FaPhoneAlt className="text-gold me-3 mt-1 fs-5 flex-shrink-0" />
                <span>
                  <strong>Contact Numbers:</strong><br />
                  Reception: <a href="tel:7320906311" className="text-white">7320906311</a><br />
                  Office: <a href="tel:7549689001" className="text-white">7549689001</a><br />
                  Principal: <a href="tel:8882737505" className="text-white">8882737505</a>
                </span>
              </li>
              <li className="d-flex mb-2">
                <FaEnvelope className="text-gold me-3 mt-1 fs-5 flex-shrink-0" />
                <span>
                  <strong>Official Email:</strong><br />
                  <a href="mailto:ramakishoresinghdegreecollege@gmail.com" className="text-white">ramakishoresinghdegreecollege@gmail.com</a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom text-center">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start mb-2 mb-md-0">
              © {new Date().getFullYear()} Rama Kishore Singh Degree College. All Rights Reserved.
            </div>
            <div className="col-md-6 text-md-end">
              <span className="small me-3">Affiliated to B.R.A. Bihar University, Muzaffarpur</span>
              <Link to="/admin/login" className="text-gold hover-underline small">Admin Panel</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
