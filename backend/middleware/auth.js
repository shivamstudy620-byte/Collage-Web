const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is not configured.');
  }
  const trimmed = secret.trim();
  if (
    trimmed.includes('YOUR_') ||
    trimmed === 'rksd_degree_college_dev_only_jwt_secret_key'
  ) {
    throw new Error('JWT_SECRET contains an insecure placeholder value.');
  }
  return trimmed;
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Malformed authentication header.' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Missing bearer token.' });
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (configErr) {
    console.error('JWT configuration error:', configErr.message);
    return res.status(500).json({ message: 'Authentication service is not configured.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid authentication token. Please log in again.' });
  }

  if (!decoded || !decoded.id) {
    return res.status(403).json({ message: 'Invalid token payload.' });
  }

  // Require active database connection to verify session against current admin record
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Unable to verify session.' });
  }

  try {
    const idStr = String(decoded.id).trim();
    let admin = null;
    if (mongoose.Types.ObjectId.isValid(idStr)) {
      admin = await Admin.findById(idStr).select('_id username token_version password_changed_at');
    } else if (/^\d+$/.test(idStr)) {
      admin = await Admin.findOne({ sqlite_id: Number(idStr) }).select('_id username token_version password_changed_at');
    }

    if (!admin) {
      return res.status(401).json({ message: 'Admin account no longer exists. Please log in again.' });
    }

    const currentVersion = admin.token_version || 0;
    const tokenVersion = typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : 0;
    if (tokenVersion !== currentVersion) {
      return res.status(401).json({ message: 'Session invalidated due to password change. Please log in again.' });
    }

    if (admin.password_changed_at && decoded.iat) {
      const changedAtSeconds = Math.floor(admin.password_changed_at.getTime() / 1000);
      if (decoded.iat < changedAtSeconds) {
        return res.status(401).json({ message: 'Session expired after password change. Please log in again.' });
      }
    }

    req.admin = {
      id: admin._id.toString(),
      username: admin.username,
      tokenVersion: currentVersion
    };
    next();
  } catch (err) {
    console.error('Session verification error:', err.message);
    return res.status(500).json({ message: 'Failed to verify authentication session.' });
  }
};

module.exports = verifyToken;
module.exports.getJwtSecret = getJwtSecret;
