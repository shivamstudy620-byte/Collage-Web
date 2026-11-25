import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaAward, FaUniversity } from 'react-icons/fa';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="container">
        <div className="row align-items-center gy-2">
          <div className="col-lg-7 col-md-8 text-center text-md-start">
            <span className="me-3 d-inline-block">
              <FaUniversity className="me-1 text-gold" />
              <strong>Affiliated:</strong> B.R.A. Bihar University, Muzaffarpur
            </span>
            <span className="d-inline-block">
              <FaAward className="me-1 text-gold" />
              <strong>Approved:</strong> Govt. of Bihar
            </span>
          </div>

          <div className="col-lg-5 col-md-4 text-center text-md-end">
            <span className="me-3 d-inline-block">
              <FaPhoneAlt className="me-1" />
              <a href="tel:7320906311">7320906311</a> / <a href="tel:7549689001">7549689001</a>
            </span>
            <span className="d-inline-block">
              <FaEnvelope className="me-1" />
              <a href="mailto:ramakishoresinghdegreecollege@gmail.com">Email Us</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
