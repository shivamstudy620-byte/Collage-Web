import React from 'react';
import buildingImg from '../assets/building_front.jpg';
import { FaUniversity, FaAward, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const About = () => {
  return (
    <div>
      {/* Page Banner */}
      <section className="bg-navy text-white py-5 position-relative">
        <div className="container py-3">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Institutional Overview</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">About Our College</h1>
          <p className="lead text-slate-300 mb-0">
            Rama Kishore Singh Degree College — Bihjadi, Sahdei Buzurg, Vaishali, Bihar
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row gy-4 align-items-center mb-5">
            <div className="col-lg-6">
              <h2 className="section-title text-start mb-4">College Overview</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                <strong>Rama Kishore Singh Degree College</strong> is an institution dedicated to imparting higher degree education to students in Vaishali and surrounding regions of Bihar.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                The college functions under the permanent affiliation of <strong>B.R.A. Bihar University, Muzaffarpur</strong> and holds official approval from the <strong>Government of Bihar</strong>. The institution offers undergraduate courses across Arts, Science, and Commerce streams.
              </p>
              
              <div className="bg-light p-4 rounded-lg border border-slate-200 mb-4">
                <h5 className="font-heading text-navy fw-bold mb-3">Official Approvals & Affiliations</h5>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-start mb-3">
                    <FaCheckCircle className="text-primary-custom me-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Affiliated University:</strong><br />
                      B.R.A. Bihar University, Muzaffarpur
                    </div>
                  </li>
                  <li className="d-flex align-items-start mb-3">
                    <FaCheckCircle className="text-primary-custom me-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong>State Government Authorization:</strong><br />
                      Approved by Government of Bihar
                    </div>
                  </li>
                  <li className="d-flex align-items-start">
                    <FaCheckCircle className="text-primary-custom me-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Establishment:</strong><br />
                      Estd-2025
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="shadow-lg rounded-lg overflow-hidden border border-slate-200">
                <img src={buildingImg} alt="Rama Kishore Singh Degree College Main Building" className="img-fluid w-100" />
                <div className="p-3 bg-navy text-white text-center">
                  <small className="text-gold fw-bold">Official Campus Main Building — Bihjadi, Sahdei Buzurg</small>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Purpose */}
          <div className="row g-4 mt-2">
            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-primary-custom fs-2 mb-3">
                  <FaUniversity />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-2">University Curriculum</h4>
                <p className="small text-muted mb-0">
                  Degree programs structured strictly in compliance with regulations prescribed by B.R.A. Bihar University, Muzaffarpur.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-navy fs-2 mb-3">
                  <FaAward />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-2">Government Approval</h4>
                <p className="small text-muted mb-0">
                  Recognized and approved by the Department of Higher Education, Government of Bihar for undergraduate degree studies.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-gold fs-2 mb-3">
                  <FaMapMarkerAlt />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-2">Campus Location</h4>
                <p className="small text-muted mb-0">
                  Located at Bihjadi, Kumharkol Buzurg, Sahdei Buzurg, Vaishali - 844509, Bihar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
