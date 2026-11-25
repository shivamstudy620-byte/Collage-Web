const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-z0-9_.-]+$/, 'Username may only contain letters, numbers, underscores, dots, and hyphens']
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  token_version: {
    type: Number,
    default: 0
  },
  password_changed_at: {
    type: Date,
    default: null
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
      delete ret.password_hash;
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

// Instance method to compare password
adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password_hash);
};

// Static helper to hash password
adminSchema.statics.hashPassword = function (plainPassword) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
