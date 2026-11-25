import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../services/api';
import { FaCalendarAlt, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

const NoticeDetail = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotice = useCallback(() => {
    setLoading(true);
    setError('');
    api.get(`/notices/${id}`)
      .then((res) => {
        setNotice(res.data);
      })
      .catch((err) => {
        console.error('Error fetching notice details:', err);
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Notice not found.');
        } else {
          setError('Unable to load notice details from the server. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchNotice();
  }, [fetchNotice]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading notice...</span>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Notice not found.'}</div>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Link to="/notices" className="btn btn-primary-custom">Back to Notice Board</Link>
          {error && error !== 'Notice not found.' && (
            <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={fetchNotice}>Retry</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-navy text-white py-4">
        <div className="container">
          <Link to="/notices" className="text-gold small d-inline-flex align-items-center mb-2">
            <FaArrowLeft className="me-1" /> Back to Notice Board
          </Link>
          <h1 className="h3 font-heading fw-bold text-white mb-0">{notice.title}</h1>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="card-custom p-4 border-top border-4 border-danger shadow-sm mx-auto" style={{ maxWidth: '56rem' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-4">
              <span className="badge bg-danger px-3 py-2">
                <FaCalendarAlt className="me-1" /> Published Date: {notice.notice_date}
              </span>
              <span className="small text-muted">Rama Kishore Singh Degree College</span>
            </div>

            <div className="notice-body text-slate-800 leading-relaxed mb-4" style={{ fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
              {notice.description || 'No detailed description provided.'}
            </div>

            {notice.pdf_path && (
              <div className="p-3 bg-light rounded border border-slate-200 d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
                <div>
                  <strong className="text-navy d-block mb-1">Attached PDF Document</strong>
                  <span className="small text-muted">Official signed circular PDF file</span>
                </div>
                <a
                  href={getAssetUrl(notice.pdf_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-danger d-inline-flex align-items-center"
                >
                  <FaFilePdf className="me-2" /> View / Download Attached PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoticeDetail;
