const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { getJwtSecret } = require('../middleware/auth');

// Precomputed dummy hash for constant-time comparison when username does not exist
const DUMMY_BCRYPT_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8lM7v9U6x2Y0iQ9J0G3a5qX1q7o6S2';

const WEAK_PASSWORDS = new Set([
  'admin123',
  'password',
  'password123',
  '123456',
  '12345678',
  '123456789',
  'qwerty123',
  'admin@123'
]);

const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') {
    return 'Password must be a valid string.';
  }
  if (password.length < 8) {
    return 'New password must be at least 8 characters long.';
  }
  if (password.length > 128) {
    return 'New password cannot exceed 128 characters.';
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return 'New password must include at least one letter and one number.';
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return 'New password is too common. Please choose a stronger password.';
  }
  return null;
};

const findAdminByIdOrLegacy = (id) => {
  if (typeof id !== 'string' && typeof id !== 'number') return null;
  const idStr = String(id).trim();

  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return Admin.findOne({ _id: idStr });
  }
  if (/^\d+$/.test(idStr)) {
    return Admin.findOne({ sqlite_id: Number(idStr) });
  }
  return null;
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // Strict type check to prevent NoSQL injection via objects/arrays
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Valid username and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 50 || !/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({ message: 'Valid username and password are required.' });
    }

    if (password.length > 128) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const admin = await Admin.findOne({ username: cleanUsername });
    if (!admin) {
      // Perform dummy comparison to reduce user-enumeration timing differences
      bcrypt.compareSync(password, DUMMY_BCRYPT_HASH);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const secret = getJwtSecret();
    const tokenVersion = admin.token_version || 0;
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        tokenVersion
      },
      secret,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Authentication processing failed.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized session.' });
    }

    if (
      !oldPassword ||
      !newPassword ||
      typeof oldPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return res.status(400).json({ message: strengthError });
    }

    const admin = await findAdminByIdOrLegacy(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin record not found.' });
    }

    const isMatch = admin.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password entered is incorrect.' });
    }

    admin.password_hash = Admin.hashPassword(newPassword);
    admin.token_version = (admin.token_version || 0) + 1;
    admin.password_changed_at = new Date();
    await admin.save();

    // Issue a fresh token for the current session while invalidating all prior tokens
    const secret = getJwtSecret();
    const newToken = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        tokenVersion: admin.token_version
      },
      secret,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    return res.json({
      message: 'Password updated successfully. All previous sessions have been invalidated.',
      token: newToken
    });
  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};

const getMe = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized session.' });
    }

    const admin = await findAdminByIdOrLegacy(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    return res.json({
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    return res.status(500).json({ message: 'Error retrieving profile.' });
  }
};

module.exports = {
  login,
  changePassword,
  getMe,
  validatePasswordStrength
};
