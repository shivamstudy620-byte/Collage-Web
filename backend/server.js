const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, mongoose } = require('./config/db');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const { getJwtSecret } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Required when running behind reverse proxies such as Render so rate limiting uses real client IP
app.set('trust proxy', 1);

// HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Assets and maps are served across authorized external CDNs
}));

// Strict CORS configuration
const parseAllowedOrigins = () => {
  const rawFrontendUrl = process.env.FRONTEND_URL || '';
  return rawFrontendUrl
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter((u) => u && !u.includes('YOUR_'));
};

const devAllowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. health probes, server-to-server, curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const configuredOrigins = parseAllowedOrigins();

    if (isProd) {
      if (configuredOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      const err = new Error('CORS request rejected: origin not authorized by policy.');
      err.status = 403;
      return callback(err);
    }

    // Development allows localhost/127.0.0.1 and any explicitly configured FRONTEND_URL
    if (
      devAllowedOrigins.has(cleanOrigin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(cleanOrigin) ||
      configuredOrigins.includes(cleanOrigin)
    ) {
      return callback(null, true);
    }

    const err = new Error('CORS request rejected: origin not allowed in development mode.');
    err.status = 403;
    return callback(err);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body size limits (prevents payload bomb DoS attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NoSQL injection & prototype-pollution protection
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      sanitizeInput(obj[i]);
    }
    return obj;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.') || DANGEROUS_KEYS.has(key)) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInput(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// General API Rate Limiting (300 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests from this IP address. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', generalLimiter);

// Serve static uploads directory only in non-production for local development/legacy assets
if (!isProd) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Serve static assets
app.use('/static-assets', express.static(path.join(__dirname, 'static-assets')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check endpoint (accurately reports DB readiness without leaking internal details)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'OK' : 'DEGRADED',
    service: 'RKSD College API',
    database: isDbConnected ? 'connected' : 'disconnected',
    college: 'Rama Kishore Singh Degree College',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist in single-server deployment if available
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Production error handling middleware (never leaks stack traces or internal parser details)
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload exceeds maximum allowed size (1MB).' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON request body.' });
  }

  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed for submitted data.' });
  }

  if (err && err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier or parameter format.' });
  }

  const statusCode = err.status || err.statusCode || 500;
  console.error('Handled application error:', err.message);

  res.status(statusCode).json({
    message: isProd && statusCode >= 500
      ? 'An internal error occurred. Please contact administrator.'
      : err.message || 'Internal server error'
  });
});

const validateProductionConfig = () => {
  const errors = [];

  try {
    getJwtSecret();
  } catch (err) {
    errors.push(err.message);
  }

  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_')) {
    errors.push('MONGODB_URI environment variable is missing or placeholder.');
  }

  if (!isCloudinaryConfigured()) {
    errors.push('Cloudinary credentials (CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or invalid.');
  }

  if (parseAllowedOrigins().length === 0) {
    errors.push('FRONTEND_URL environment variable must be configured with exact allowed production origin(s).');
  }

  return errors;
};

// Connect to MongoDB and start server if executed directly
const startServer = async () => {
  if (isProd) {
    const configErrors = validateProductionConfig();
    if (configErrors.length > 0) {
      console.error('❌ FATAL PRODUCTION CONFIGURATION ERRORS:');
      configErrors.forEach((msg) => console.error(`   - ${msg}`));
      process.exit(1);
    }
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('Fatal database initialization error:', err.message);
    if (isProd) {
      process.exit(1);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RKSD College Backend running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, validateProductionConfig };
