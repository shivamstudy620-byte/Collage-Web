const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    unique: true,
    trim: true,
    maxlength: [150, 'Course name cannot exceed 150 characters']
  },
  duration: {
    type: String,
    trim: true,
    default: '3 Years Degree Course',
    maxlength: [100, 'Duration cannot exceed 100 characters']
  },
  eligibility: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Eligibility cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
