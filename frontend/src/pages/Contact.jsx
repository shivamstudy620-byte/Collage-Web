import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUniversity, FaMap, FaSatellite } from 'react-icons/fa';

const Contact = () => {
  const [mapView, setMapView] = useState('google');
  const mapboxToken = (import.meta.env.VITE_MAP_TOKEN || '').trim();
  const hasMapboxToken = Boolean(mapboxToken && !mapboxToken.includes('YOUR_'));

  const mapboxSatelliteUrl = hasMapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-s-college+e11d48(85.469201,25.653915)/85.469201,25.653915,15,0/1200x500@2x?access_token=${mapboxToken}`
    : '';
  const mapboxStreetsUrl = hasMapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-college+e11d48(85.469201,25.653915)/85.469201,25.653915,14,0/1200x500@2x?access_token=${mapboxToken}`
    : '';

  return (
    <div>
      {/* Banner */}
      <section className="bg-navy text-white py-5">
        <div className="container py-3">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Official Contacts</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">Contact &amp; Location Information</h1>
          <p className="lead text-slate-300 mb-0">
            Rama Kishore Singh Degree College, Bihjadi, Sahdei Buzurg, Vaishali, Bihar
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row gy-4">
            {/* Address Card */}
            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center h-100 border-top border-4 border-danger shadow-sm">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-primary-custom fs-2 mb-3">
                  <FaMapMarkerAlt />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-3">College Address</h4>
                <p className="text-slate-700 mb-0 leading-relaxed">
                  <strong>Rama Kishore Singh Degree College</strong><br />
                  Bihjadi, Kumharkol Buzurg,<br />
                  Post: Sahdei Buzurg,<br />
                  District: Vaishali - 844509,<br />
                  State: Bihar, India
                </p>
              </div>
            </div>

            {/* Phone Numbers Card */}
            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center h-100 border-top border-4 border-navy shadow-sm">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-navy fs-2 mb-3">
                  <FaPhoneAlt />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-3">Telephone Desk</h4>
                <ul className="list-unstyled text-slate-700 mb-0 text-start d-inline-block">
                  <li className="mb-2">
                    <strong>Reception Desk:</strong><br />
                    <a href="tel:7320906311" className="text-primary-custom fw-semibold fs-5">7320906311</a>
                  </li>
                  <li className="mb-2">
                    <strong>Administrative Office:</strong><br />
                    <a href="tel:7549689001" className="text-primary-custom fw-semibold fs-5">7549689001</a>
                  </li>
                  <li>
                    <strong>Principal&apos;s Desk:</strong><br />
                    <a href="tel:8882737505" className="text-primary-custom fw-semibold fs-5">8882737505</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Email & Affiliation Card */}
            <div className="col-md-6 col-lg-4">
              <div className="card-custom p-4 text-center h-100 border-top border-4 border-warning shadow-sm">
                <div className="d-inline-flex p-3 bg-light rounded-circle text-gold fs-2 mb-3">
                  <FaEnvelope />
                </div>
                <h4 className="font-heading text-navy fw-bold mb-3">Electronic Mail</h4>
                <p className="text-slate-700 mb-3">
                  <strong>Official Email Address:</strong><br />
                  <a href="mailto:ramakishoresinghdegreecollege@gmail.com" className="text-primary-custom fw-semibold word-break">
                    ramakishoresinghdegreecollege@gmail.com
                  </a>
                </p>
                <hr className="my-3" />
                <p className="small text-muted mb-0">
                  <FaUniversity className="me-1 text-navy" /> Affiliated to B.R.A. Bihar University, Muzaffarpur
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Campus Map Section with Google Maps & Mapbox */}
          <div className="mt-5">
            <div className="card-custom p-4 shadow-sm border border-slate-200">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                  <h3 className="font-heading text-navy fw-bold mb-1">Interactive Campus Location Map</h3>
                  <p className="text-slate-600 mb-0 small">
                    Rama Kishore Singh Degree College, Bihjadi, Sahdei Buzurg, Vaishali, Bihar - 844509
                  </p>
                </div>
                <div className="btn-group btn-group-sm flex-wrap" role="group" aria-label="Map view selector">
                  <button
                    type="button"
                    className={`btn ${mapView === 'google' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setMapView('google')}
                  >
                    Google Maps
                  </button>
                  {hasMapboxToken && (
                    <>
                      <button
                        type="button"
                        className={`btn ${mapView === 'mapbox-satellite' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setMapView('mapbox-satellite')}
                      >
                        <FaSatellite className="me-1" /> Mapbox Satellite
                      </button>
                      <button
                        type="button"
                        className={`btn ${mapView === 'mapbox-streets' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setMapView('mapbox-streets')}
                      >
                        <FaMap className="me-1" /> Mapbox Streets
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="ratio ratio-21x9 map-container-responsive rounded overflow-hidden shadow-inner border border-slate-200">
                {mapView === 'google' && (
                  <iframe
                    title="Rama Kishore Singh Degree College Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.5241064010766!2d85.4692013748524!3d25.65391551305173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed7d3b708aa397%3A0x7b94b7b94dcdb2a9!2sRama%20Kishore%20Singh%20Mahavidyalaya!5e0!3m2!1sen!2sin!4v1789669100344!5m2!1sen!2sin"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ border: 0 }}
                  ></iframe>
                )}
                {mapView === 'mapbox-satellite' && hasMapboxToken && (
                  <img
                    src={mapboxSatelliteUrl}
                    alt="Mapbox Satellite View of Rama Kishore Singh Degree College"
                    className="w-100 h-100 object-fit-cover"
                  />
                )}
                {mapView === 'mapbox-streets' && hasMapboxToken && (
                  <img
                    src={mapboxStreetsUrl}
                    alt="Mapbox Streets View of Rama Kishore Singh Degree College"
                    className="w-100 h-100 object-fit-cover"
                  />
                )}
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 small text-muted gap-2">
                <span>Coordinates: 25.6539° N, 85.4692° E</span>
                <span>Powered by {mapView === 'google' ? 'Google Maps' : 'Mapbox Streets & Satellite API'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
