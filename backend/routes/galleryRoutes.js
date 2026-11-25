const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const verifyToken = require('../middleware/auth');
const { uploadGalleryImage, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', galleryController.getAllGallery);

// Protected admin routes
router.post('/', verifyToken, handleUploadError(uploadGalleryImage.single('image'), 'image'), galleryController.uploadGallery);
router.delete('/:id', verifyToken, galleryController.deleteGallery);

module.exports = router;
