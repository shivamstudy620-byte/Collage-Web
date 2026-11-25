const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image_path: {
    type: String,
    required: [true, 'Image path or URL is required'],
    trim: true,
    maxlength: [1000, 'Image path cannot exceed 1000 characters']
  },
  cloudinary_public_id: {
    type: String,
    trim: true,
    default: null
  },
  title: {
    type: String,
    trim: true,
    default: 'Campus Photograph',
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    trim: true,
    default: 'Campus',
    maxlength: [100, 'Category cannot exceed 100 characters'],
    index: true
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

gallerySchema.index({ created_at: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
