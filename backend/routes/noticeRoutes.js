const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const verifyToken = require('../middleware/auth');
const { uploadNoticePDF, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', noticeController.getAllNotices);
router.get('/:id', noticeController.getNoticeById);

// Protected admin routes
router.post('/', verifyToken, handleUploadError(uploadNoticePDF.single('pdf'), 'pdf'), noticeController.createNotice);
router.put('/:id', verifyToken, handleUploadError(uploadNoticePDF.single('pdf'), 'pdf'), noticeController.updateNotice);
router.delete('/:id', verifyToken, noticeController.deleteNotice);

module.exports = router;
