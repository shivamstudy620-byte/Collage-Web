import React, { useState, useEffect, useCallback } from 'react';
import api, { getAssetUrl } from '../services/api';
import LightboxModal from '../components/LightboxModal';
import { FaExpand } from 'react-icons/fa';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gallery');
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Unable to load campus gallery photos right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const categories = ['All', ...new Set(gallery.map((g) => g.category || 'General'))];

  const filteredGallery = activeCategory === 'All'
    ? gallery
    : gallery.filter((g) => (g.category || 'General') === activeCategory);

  return (
    <div>
      {/* Banner */}
      <section className="bg-navy text-white py-5">
        <div className="container py-3">
          <span className="text-gold font-semibold text-uppercase small tracking-wider">Visual Campus Tour</span>
          <h1 className="display-5 font-heading fw-bold text-white mb-2">College Photo Gallery</h1>
          <p className="lead text-slate-300 mb-0">
            Building architecture, spacious campus lawns, and academic infrastructure
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-5 bg-white">
        <div className="container">
          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`btn btn-sm rounded-pill px-4 ${activeCategory === cat ? 'btn-danger' : 'btn-outline-dark'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading gallery...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center d-flex flex-column align-items-center gap-2 py-4">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchGallery}>Retry</button>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="alert alert-info text-center py-4">
              No gallery photographs uploaded yet.
            </div>
          ) : (
            <div className="row g-4">
              {filteredGallery.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4">
                  <div
                    className="gallery-img-wrapper"
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${item.title || 'Campus Photograph'}`}
                    onClick={() => setSelectedImage(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedImage(item);
                      }
                    }}
                  >
                    <img
                      src={getAssetUrl(item.image_path)}
                      alt={item.title || 'College Photo'}
                      className="gallery-img"
                    />
                    <div className="gallery-overlay">
                      <span className="badge bg-danger mb-2 align-self-start">{item.category || 'Campus'}</span>
                      <h5 className="font-heading fw-bold mb-1 text-white">{item.title || 'Campus Photograph'}</h5>
                      <small className="text-gold d-flex align-items-center">
                        <FaExpand className="me-1" /> Click to enlarge preview
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default Gallery;
