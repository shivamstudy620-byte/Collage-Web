const multer = require('multer');
const path = require('path');

// Use in-memory storage so uploads stream directly to Cloudinary
// without leaving orphaned temporary files on ephemeral container disks
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_PDF_MIMES = new Set(['application/pdf', 'application/x-pdf']);

/**
 * Inspect magic-byte file signatures on uploaded buffers to prevent MIME/extension spoofing.
 */
const hasValidImageSignature = (buffer, ext) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  // WEBP: "RIFF" + 4 bytes + "WEBP"
  const isWebp =
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (ext === '.jpg' || ext === '.jpeg') return isJpeg;
  if (ext === '.png') return isPng;
  if (ext === '.webp') return isWebp;
  return false;
};

const hasValidPdfSignature = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 5) return false;
  // Allow optional UTF-8 BOM or leading whitespace before %PDF-
  const head = buffer.subarray(0, 1024).toString('latin1');
  return head.includes('%PDF-');
};

// File filters (reject obviously invalid extensions/MIMEs before buffering completes)
const imageFilter = (req, file, cb) => {
  const ext = path.extname(String(file.originalname || '')).toLowerCase();
  const mime = String(file.mimetype || '').toLowerCase();

  if (ALLOWED_IMAGE_EXTS.has(ext) && ALLOWED_IMAGE_MIMES.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, JPEG, PNG, WEBP) are allowed.'));
  }
};

const pdfFilter = (req, file, cb) => {
  const ext = path.extname(String(file.originalname || '')).toLowerCase();
  const mime = String(file.mimetype || '').toLowerCase();

  if (ext === '.pdf' && ALLOWED_PDF_MIMES.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed for notices.'));
  }
};

// Multer instances
const uploadGalleryImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 } // 5MB limit
});

const uploadNoticePDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10MB limit
});

/**
 * Middleware wrapper to catch Multer errors, validate file magic bytes, and format JSON responses
 * @param {Function} uploadMiddleware - Multer single-file middleware
 * @param {'image'|'pdf'} expectedType - Expected binary file type
 */
const handleUploadError = (uploadMiddleware, expectedType) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ message: 'File is too large. Maximum allowed size exceeded.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (req.file) {
        const ext = path.extname(String(req.file.originalname || '')).toLowerCase();
        if (expectedType === 'image' && !hasValidImageSignature(req.file.buffer, ext)) {
          return res.status(400).json({
            message: 'Uploaded file signature does not match a valid JPG, PNG, or WEBP image.'
          });
        }
        if (expectedType === 'pdf' && !hasValidPdfSignature(req.file.buffer)) {
          return res.status(400).json({
            message: 'Uploaded file is not a valid PDF document.'
          });
        }
      }

      next();
    });
  };
};

module.exports = {
  uploadGalleryImage,
  uploadNoticePDF,
  handleUploadError,
  hasValidImageSignature,
  hasValidPdfSignature
};
