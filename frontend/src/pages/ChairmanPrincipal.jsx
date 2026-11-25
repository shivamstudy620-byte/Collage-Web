import React from 'react';
import chairmanImg from '../assets/Rama Kishore Singh.jpeg';
import principalImg from '../assets/principal.jpeg';
import { FaUserTie, FaUserGraduate, FaUniversity, FaBuilding } from 'react-icons/fa';

const ChairmanPrincipal = () => {
  return (
    <div>
      {/* Banner */}
      <section className="bg-navy text-white py-5">
        <div className="container py-3 text-center text-md-start">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Leadership & Administration</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">Chairman & Principal</h1>
          <p className="lead text-slate-300 mb-0">
            Institutional Administration of Rama Kishore Singh Degree College
          </p>
        </div>
      </section>

      {/* Profiles */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center gy-5">
            {/* Chairman Profile */}
            <div className="col-lg-5 col-md-6">
              <div className="card-custom p-4 text-center h-100 shadow-md">
                <div className="profile-avatar-wrapper bg-navy text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '150px', height: '150px', fontSize: '3rem' }}>
                  <img className="chair_man" src={chairmanImg} alt="Shri Rama Kishore Singh" />
                </div>
                <span className="badge bg-danger px-3 py-2 rounded-pill mb-2">Institutional Chairman</span>
                <h2 className="font-heading text-navy fw-bold mb-1">Shri Rama Kishore Singh</h2>
                <div className="text-primary-custom fw-semibold mb-3 fs-5">Chairman</div>
                <div className="d-inline-block bg-light px-3 py-2 rounded border border-slate-200 text-slate-700 fw-medium mb-4">
                  <div>Former MP</div>
                  <p className="mb-0 mt-1 small">Education: Babasaheb Bhimrao Ambedkar Bihar University, Langat Singh College. Previous office: Member of the Lok Sabha (2014–2019)</p>
                </div>
                <hr className="my-3" />
                <p className="text-muted small mb-0">
                  Guiding Rama Kishore Singh Degree College in its educational mission to serve the academic needs of Vaishali district and Bihar.
                </p>
              </div>
            </div>

            {/* Principal Profile */}
            <div className="col-lg-5 col-md-6">
              <div className="card-custom p-4 text-center h-100 shadow-md">
                <div className="profile-avatar-wrapper bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '150px', height: '150px', fontSize: '3rem' }}>
                  <img className="principal" src={principalImg} alt="Mr. Kishore Kunal" />
                </div>
                <span className="badge bg-primary px-3 py-2 rounded-pill mb-2">Academic Head</span>
                <h2 className="font-heading text-navy fw-bold mb-1">Mr. Kishore Kunal</h2>
                <div className="text-primary-custom fw-semibold mb-3 fs-5">Principal (M.A., M.Ed., Ph.D.)</div>
                <div className="d-inline-block bg-light px-3 py-2 rounded border border-slate-200 text-slate-700 fw-medium mb-4 text-start">
                  <strong>Principal&apos;s Message:</strong>
                  <p className="mb-0 mt-1 small">
                    <strong>Welcome to Rama Kishore Singh Degree College, Vaishali, Bihar.</strong> We are committed to providing quality, value-based education that develops students&apos; knowledge, skills, confidence, and character. With experienced faculty and diverse academic, cultural, and sports programs, we prepare students for a successful and responsible future.
                  </p>
                </div>
                <hr className="my-3" />
                <p className="text-muted small mb-0">
                  Overseeing academic administration, university compliance, faculty standards, and student affairs at Rama Kishore Singh Degree College.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Office Information */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
            <h4 className="font-heading text-navy fw-bold mb-3">Principal's Office Contact</h4>
            <p className="text-slate-600 mb-2">
              Direct Contact Number: <strong>8882737505</strong>
            </p>
            <p className="text-slate-600 mb-0">
              Official Email: <strong>ramakishoresinghdegreecollege@gmail.com</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChairmanPrincipal;
