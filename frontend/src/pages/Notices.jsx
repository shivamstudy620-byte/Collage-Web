import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../services/api';
import { FaBullhorn, FaSearch, FaCalendarAlt, FaFilePdf, FaArrowRight } from 'react-icons/fa';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/notices');
      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Unable to load notices from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = notices.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.description && n.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Banner */}
      <section className="bg-navy text-white py-5">
        <div className="container py-3">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Official Communications</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">College Notice Board</h1>
          <p className="lead text-slate-300 mb-0">
            Important announcements, university examination notices, &amp; administrative circulars
          </p>
        </div>
      </section>

      {/* Notice List */}
      <section className="py-5 bg-white">
        <div className="container">
          {/* Search bar */}
          <div className="row mb-4 justify-content-between align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <h4 className="font-heading text-navy fw-bold mb-0">
                <FaBullhorn className="me-2 text-primary-custom" /> All Official Notices
              </h4>
            </div>
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search notices by keyword..."
                  aria-label="Search notices by keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading notices...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger py-4 text-center d-flex flex-column align-items-center gap-2">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchNotices}>Retry</button>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="alert alert-info py-4 text-center">
              {searchTerm ? 'No notices found matching your search.' : 'No notices published on the notice board.'}
            </div>
          ) : (
            <div className="row g-4">
              {filteredNotices.map((notice) => (
                <div key={notice.id} className="col-12">
                  <div className="card-custom p-4 border-start border-4 border-danger shadow-sm">
                    <div className="row align-items-center gy-3">
                      <div className="col-lg-9">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          <span className="badge bg-danger px-3 py-1">
                            <FaCalendarAlt className="me-1" /> {notice.notice_date}
                          </span>
                          <span className="badge bg-light text-navy border border-slate-300">
                            Official Circular
                          </span>
                        </div>
                        <h4 className="font-heading text-navy fw-bold mb-2">{notice.title}</h4>
                        {notice.description && (
                          <p className="text-slate-600 mb-0 small leading-relaxed">
                            {notice.description}
                          </p>
                        )}
                      </div>

                      <div className="col-lg-3 text-lg-end">
                        {notice.pdf_path ? (
                          <a
                            href={getAssetUrl(notice.pdf_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-danger w-100 d-inline-flex align-items-center justify-content-center"
                          >
                            <FaFilePdf className="me-2" /> Download PDF Notice
                          </a>
                        ) : (
                          <Link to={`/notices/${notice.id}`} className="btn btn-outline-dark w-100">
                            View Notice <FaArrowRight className="ms-1" />
                          </Link>
                        )}
                      </div>
                    </div>
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

export default Notices;
