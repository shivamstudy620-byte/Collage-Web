const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [300, 'Notice title cannot exceed 300 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  pdf_path: {
    type: String,
    trim: true,
    default: null,
    maxlength: [1000, 'PDF path cannot exceed 1000 characters']
  },
  cloudinary_public_id: {
    type: String,
    trim: true,
    default: null
  },
  notice_date: {
    type: String,
    required: [true, 'Notice date is required'],
    trim: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Notice date must be in YYYY-MM-DD format']
  },
  sqlite_id: {
    type: Number,
    unique: true,
    sparse: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

noticeSchema.index({ notice_date: -1, created_at: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
