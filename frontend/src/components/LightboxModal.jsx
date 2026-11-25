import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getAssetUrl } from '../services/api';

const LightboxModal = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-modal-title"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(11, 27, 61, 0.9)', zIndex: 1060 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark text-white border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="modal-header border-bottom border-secondary d-flex justify-content-between align-items-center">
            <h5 id="lightbox-modal-title" className="modal-title font-heading text-white">{image.title || 'Campus Photograph'}</h5>
            <button
              type="button"
              className="btn text-white fs-4 p-0 ms-auto"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
          <div className="modal-body p-0 text-center bg-black">
            <img
              src={getAssetUrl(image.image_path)}
              alt={image.title || 'College Photo'}
              className="img-fluid"
              style={{ maxHeight: '75vh', objectFit: 'contain' }}
            />
          </div>
          {image.category && (
            <div className="modal-footer border-top border-secondary py-2 justify-content-between text-light opacity-75 small">
              <span>Category: <strong className="text-white">{image.category}</strong></span>
              <span>Rama Kishore Singh Degree College</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightboxModal;
