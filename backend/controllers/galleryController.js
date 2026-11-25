const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Gallery = require('../models/Gallery');
const { isValidResourceId, findByIdOrLegacy, ensureDbConnected } = require('../utils/dbHelpers');
const {
  isCloudinaryConfigured,
  uploadStreamToCloudinary,
  deleteFromCloudinary
} = require('../config/cloudinary');

const getAllGallery = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const items = await Gallery.find().sort({ created_at: -1, _id: -1 });
    return res.json(items);
  } catch (err) {
    console.error('Error fetching gallery:', err.message);
    return res.status(500).json({ message: 'Failed to fetch gallery items.' });
  }
};

const uploadGallery = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const { title, category } = req.body || {};
  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ message: 'Gallery title must be a valid string.' });
  }
  if (category !== undefined && typeof category !== 'string') {
    return res.status(400).json({ message: 'Gallery category must be a valid string.' });
  }
  if (!ensureDbConnected(res)) return;

  const isProd = process.env.NODE_ENV === 'production';
  let imagePath = '';
  let cloudinaryPublicId = null;
  let localSavedPath = null;

  try {
    if (isCloudinaryConfigured()) {
      const uploadRes = await uploadStreamToCloudinary(req.file.buffer, {
        folder: 'rksd_college/gallery',
        resource_type: 'image',
        public_id: `gallery-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
      });
      imagePath = uploadRes.secure_url;
      cloudinaryPublicId = uploadRes.public_id;
    } else {
      if (isProd) {
        return res.status(500).json({
          message: 'Cloudinary storage is required in production. Please configure Cloudinary credentials.'
        });
      }
      // Local fallback for offline development only
      const uploadDir = path.join(__dirname, '../uploads/gallery');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `gallery-${uniqueSuffix}${ext}`;
      localSavedPath = path.join(uploadDir, filename);
      fs.writeFileSync(localSavedPath, req.file.buffer);
      imagePath = `/uploads/gallery/${filename}`;
    }

    const cleanTitle = (title && title.trim()) ? title.trim() : 'Campus Photograph';
    const cleanCategory = (category && category.trim()) ? category.trim() : 'Campus';

    const item = await Gallery.create({
      image_path: imagePath,
      cloudinary_public_id: cloudinaryPublicId,
      title: cleanTitle,
      category: cleanCategory
    });

    return res.status(201).json({
      message: 'Gallery image uploaded successfully.',
      item
    });
  } catch (err) {
    // Clean up newly uploaded asset if database persistence failed
    if (cloudinaryPublicId) {
      await deleteFromCloudinary(cloudinaryPublicId, 'image');
    }
    if (localSavedPath && fs.existsSync(localSavedPath)) {
      try { fs.unlinkSync(localSavedPath); } catch (e) { /* ignore */ }
    }
    console.error('Error uploading gallery image:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to upload gallery image.' });
  }
};

const deleteGallery = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid gallery item ID format.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const item = await findByIdOrLegacy(Gallery, id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    if (item.cloudinary_public_id) {
      await deleteFromCloudinary(item.cloudinary_public_id, 'image');
    } else if (item.image_path && item.image_path.startsWith('/uploads/')) {
      const localPath = path.resolve(__dirname, '..', item.image_path.replace(/^\/+/, ''));
      const uploadsRoot = path.resolve(__dirname, '../uploads');
      if (localPath.startsWith(uploadsRoot) && fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (unlinkErr) {
          console.warn('Could not remove local file:', unlinkErr.message);
        }
      }
    }

    await Gallery.deleteOne({ _id: item._id });
    return res.json({ message: 'Gallery item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting gallery item:', err.message);
    return res.status(500).json({ message: 'Failed to delete gallery item.' });
  }
};

module.exports = {
  getAllGallery,
  uploadGallery,
  deleteGallery
};
