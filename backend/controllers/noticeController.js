const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Notice = require('../models/Notice');
const { isValidResourceId, findByIdOrLegacy, ensureDbConnected } = require('../utils/dbHelpers');
const {
  isCloudinaryConfigured,
  uploadStreamToCloudinary,
  deleteFromCloudinary
} = require('../config/cloudinary');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const removeLocalUploadIfExists = (relativePath) => {
  if (!relativePath || !relativePath.startsWith('/uploads/')) return;
  const fullPath = path.resolve(__dirname, '..', relativePath.replace(/^\/+/, ''));
  const uploadsRoot = path.resolve(__dirname, '../uploads');
  if (fullPath.startsWith(uploadsRoot) && fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (e) {
      console.warn('Could not remove local file:', e.message);
    }
  }
};

const getAllNotices = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const notices = await Notice.find().sort({ notice_date: -1, created_at: -1, _id: -1 });
    return res.json(notices);
  } catch (err) {
    console.error('Error fetching notices:', err.message);
    return res.status(500).json({ message: 'Failed to fetch notices.' });
  }
};

const getNoticeById = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid notice ID format.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const notice = await findByIdOrLegacy(Notice, id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }
    return res.json(notice);
  } catch (err) {
    console.error('Error fetching notice details:', err.message);
    return res.status(500).json({ message: 'Error retrieving notice.' });
  }
};

const createNotice = async (req, res) => {
  const { title, description, notice_date } = req.body || {};
  const isProd = process.env.NODE_ENV === 'production';

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Notice title is required.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Notice description must be a valid string.' });
  }
  if (notice_date !== undefined && (typeof notice_date !== 'string' || (notice_date.trim() && !DATE_REGEX.test(notice_date.trim())))) {
    return res.status(400).json({ message: 'Notice date must be in YYYY-MM-DD format.' });
  }
  if (!ensureDbConnected(res)) return;

  const dateToUse = (notice_date && notice_date.trim())
    ? notice_date.trim()
    : new Date().toISOString().split('T')[0];

  let pdfPath = null;
  let cloudinaryPublicId = null;
  let localSavedPath = null;

  try {
    if (req.file) {
      if (isCloudinaryConfigured()) {
        const uploadRes = await uploadStreamToCloudinary(req.file.buffer, {
          folder: 'rksd_college/notices',
          resource_type: 'raw',
          public_id: `notice-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`
        });
        pdfPath = uploadRes.secure_url;
        cloudinaryPublicId = uploadRes.public_id;
      } else {
        if (isProd) {
          return res.status(500).json({
            message: 'Cloudinary storage is required in production. Please configure Cloudinary credentials.'
          });
        }
        const uploadDir = path.join(__dirname, '../uploads/notices');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const filename = `notice-${uniqueSuffix}.pdf`;
        localSavedPath = path.join(uploadDir, filename);
        fs.writeFileSync(localSavedPath, req.file.buffer);
        pdfPath = `/uploads/notices/${filename}`;
      }
    }

    const notice = await Notice.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      pdf_path: pdfPath,
      cloudinary_public_id: cloudinaryPublicId,
      notice_date: dateToUse
    });

    return res.status(201).json({
      message: 'Notice created successfully.',
      notice
    });
  } catch (err) {
    // Prevent orphaned Cloudinary/local files if DB creation fails
    if (cloudinaryPublicId) {
      await deleteFromCloudinary(cloudinaryPublicId, 'raw');
    }
    if (localSavedPath && fs.existsSync(localSavedPath)) {
      try { fs.unlinkSync(localSavedPath); } catch (e) { /* ignore */ }
    }
    console.error('Error creating notice:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to create notice.' });
  }
};

const updateNotice = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid notice ID format.' });
  }

  const { title, description, notice_date, remove_pdf } = req.body || {};
  const isProd = process.env.NODE_ENV === 'production';

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ message: 'Notice title must be a non-empty string.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Notice description must be a valid string.' });
  }
  if (notice_date !== undefined && (typeof notice_date !== 'string' || (notice_date.trim() && !DATE_REGEX.test(notice_date.trim())))) {
    return res.status(400).json({ message: 'Notice date must be in YYYY-MM-DD format.' });
  }
  if (!ensureDbConnected(res)) return;

  let newCloudinaryPublicId = null;
  let newLocalSavedPath = null;

  try {
    const notice = await findByIdOrLegacy(Notice, id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    const oldCloudinaryPublicId = notice.cloudinary_public_id;
    const oldLocalPdfPath = notice.pdf_path;
    let shouldDeleteOldAsset = false;

    if (req.file) {
      // Upload new PDF first so old PDF is preserved if upload fails
      if (isCloudinaryConfigured()) {
        const uploadRes = await uploadStreamToCloudinary(req.file.buffer, {
          folder: 'rksd_college/notices',
          resource_type: 'raw',
          public_id: `notice-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`
        });
        newCloudinaryPublicId = uploadRes.public_id;
        notice.pdf_path = uploadRes.secure_url;
        notice.cloudinary_public_id = uploadRes.public_id;
        shouldDeleteOldAsset = true;
      } else {
        if (isProd) {
          return res.status(500).json({
            message: 'Cloudinary storage is required in production. Please configure Cloudinary credentials.'
          });
        }
        const uploadDir = path.join(__dirname, '../uploads/notices');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        const filename = `notice-${uniqueSuffix}.pdf`;
        newLocalSavedPath = path.join(uploadDir, filename);
        fs.writeFileSync(newLocalSavedPath, req.file.buffer);
        notice.pdf_path = `/uploads/notices/${filename}`;
        notice.cloudinary_public_id = null;
        shouldDeleteOldAsset = true;
      }
    } else if (remove_pdf === 'true' || remove_pdf === true) {
      notice.pdf_path = null;
      notice.cloudinary_public_id = null;
      shouldDeleteOldAsset = true;
    }

    if (title !== undefined) notice.title = title.trim();
    if (description !== undefined) notice.description = description.trim();
    if (notice_date !== undefined && notice_date.trim()) notice.notice_date = notice_date.trim();

    await notice.save();

    // Delete old asset only after new upload and DB save succeed
    if (shouldDeleteOldAsset) {
      if (oldCloudinaryPublicId) {
        await deleteFromCloudinary(oldCloudinaryPublicId, 'raw');
      } else {
        removeLocalUploadIfExists(oldLocalPdfPath);
      }
    }

    return res.json({
      message: 'Notice updated successfully.',
      notice
    });
  } catch (err) {
    // Clean up newly uploaded asset if save failed
    if (newCloudinaryPublicId) {
      await deleteFromCloudinary(newCloudinaryPublicId, 'raw');
    }
    if (newLocalSavedPath && fs.existsSync(newLocalSavedPath)) {
      try { fs.unlinkSync(newLocalSavedPath); } catch (e) { /* ignore */ }
    }
    console.error('Error updating notice:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to update notice.' });
  }
};

const deleteNotice = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid notice ID format.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const notice = await findByIdOrLegacy(Notice, id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    if (notice.cloudinary_public_id) {
      await deleteFromCloudinary(notice.cloudinary_public_id, 'raw');
    } else {
      removeLocalUploadIfExists(notice.pdf_path);
    }

    await Notice.deleteOne({ _id: notice._id });
    return res.json({ message: 'Notice deleted successfully.' });
  } catch (err) {
    console.error('Error deleting notice:', err.message);
    return res.status(500).json({ message: 'Failed to delete notice.' });
  }
};

module.exports = {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
};
