const http = require('http');
const { Duplex } = require('stream');
const jwt = require('jsonwebtoken');

// Ensure deterministic test environment before importing app/modules
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_only_jwt_secret_for_automated_suite_12345';

const { app, validateProductionConfig } = require('../server');
const { getJwtSecret } = require('../middleware/auth');
const { validatePasswordStrength } = require('../controllers/authController');
const { hasValidImageSignature, hasValidPdfSignature } = require('../middleware/upload');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { isValidResourceId } = require('../utils/dbHelpers');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const Gallery = require('../models/Gallery');
const { mongoose } = require('../config/db');

/**
 * Invoke the Express app completely in-memory using Node's IncomingMessage & ServerResponse
 * without binding TCP ports so tests run reliably in restricted/CI sandboxes.
 */
const invokeApp = (expressApp, { method = 'GET', url = '/', headers = {}, body = null } = {}) => {
  return new Promise((resolve, reject) => {
    const rawBody = body === null || body === undefined
      ? null
      : (Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));

    const reqHeaders = {};
    for (const [k, v] of Object.entries(headers)) {
      reqHeaders[k.toLowerCase()] = v;
    }
    if (rawBody !== null && !reqHeaders['content-length']) {
      reqHeaders['content-length'] = String(rawBody.length);
    }

    const socket = new Duplex({
      read() {},
      write(chunk, encoding, callback) {
        callback();
      }
    });
    socket.remoteAddress = '127.0.0.1';

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = reqHeaders;

    const res = new http.ServerResponse(req);
    const chunks = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk, encoding, cb) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      return originalWrite(chunk, encoding, cb);
    };

    res.end = (chunk, encoding, cb) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      const rawResponse = Buffer.concat(chunks).toString('utf8');
      // Strip HTTP status/headers if ServerResponse wrote raw head to buffer
      const headerSep = rawResponse.indexOf('\r\n\r\n');
      const bodyText = headerSep !== -1 ? rawResponse.slice(headerSep + 4) : rawResponse;
      let json = null;
      try {
        json = bodyText ? JSON.parse(bodyText) : null;
      } catch {
        json = null;
      }
      originalEnd(chunk, encoding, cb);
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        text: bodyText,
        json
      });
    };

    res.on('error', reject);
    expressApp(req, res);

    process.nextTick(() => {
      if (rawBody !== null) {
        req.push(rawBody);
      }
      req.push(null);
    });
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('RUNNING RKSD COLLEGE BACKEND SECURITY & API TESTS');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}${details ? ` - ${details}` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check endpoint when DB is disconnected
    const resHealth = await invokeApp(app, { url: '/api/health' });
    assert(
      resHealth.status === 503 && resHealth.json?.database === 'disconnected',
      'Health check returns 503 and reports database disconnected when not connected',
      `Got ${resHealth.status}: ${resHealth.text}`
    );
    assert(
      resHealth.json?.college === 'Rama Kishore Singh Degree College' &&
      resHealth.json?.uptime === undefined &&
      resHealth.json?.uptimeSeconds === undefined,
      'Health check identifies college without leaking uptime or internals'
    );

    // 2. Security headers & rate limiting
    assert(
      resHealth.headers['x-content-type-options'] === 'nosniff',
      'Helmet sets X-Content-Type-Options: nosniff'
    );
    assert(
      resHealth.headers['x-frame-options'] === 'SAMEORIGIN' || resHealth.headers['x-frame-options'] === 'DENY',
      'Helmet sets X-Frame-Options'
    );
    assert(
      resHealth.headers['ratelimit-limit'] !== undefined,
      'Rate limiter headers are present'
    );

    // 3. Undefined API route 404
    const res404 = await invokeApp(app, { url: '/api/nonexistent-route-xyz' });
    assert(
      res404.status === 404 && res404.json?.message === 'API endpoint not found',
      'Undefined API route returns 404 JSON'
    );

    // 4. Malformed JSON handling
    const resMalformedJson = await invokeApp(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: '{"username": "admin", broken'
    });
    assert(
      resMalformedJson.status === 400 && resMalformedJson.json?.message === 'Malformed JSON request body.',
      'Malformed JSON returns clean 400 error without stack trace',
      `Got ${resMalformedJson.status}: ${resMalformedJson.text}`
    );

    // 5. Oversized JSON payload (>1MB)
    const oversizedBody = JSON.stringify({ data: 'x'.repeat(1024 * 1024 + 1024) });
    const resOversized = await invokeApp(app, {
      method: 'POST',
      url: '/api/courses',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedBody
    });
    assert(
      resOversized.status === 413,
      'Oversized JSON payload (>1MB) is rejected with 413',
      `Got ${resOversized.status}`
    );

    // 6. Auth login validation & NoSQL injection protection
    const resEmptyLogin = await invokeApp(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: {}
    });
    assert(resEmptyLogin.status === 400, 'Login rejects empty credentials with 400');

    const resNoSqlLogin = await invokeApp(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: { username: { $ne: null }, password: { $gt: '' } }
    });
    assert(resNoSqlLogin.status === 400, 'Login rejects NoSQL injection objects with 400');

    // 7. Protected endpoints reject missing, malformed, and expired JWTs
    const resNoToken = await invokeApp(app, {
      method: 'POST',
      url: '/api/courses',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Test' }
    });
    assert(resNoToken.status === 401, 'POST /api/courses without token returns 401');

    const resNoTokenNotices = await invokeApp(app, {
      method: 'POST',
      url: '/api/notices',
      headers: { 'Content-Type': 'application/json' },
      body: { title: 'Test' }
    });
    assert(resNoTokenNotices.status === 401, 'POST /api/notices without token returns 401');

    const resNoTokenGallery = await invokeApp(app, {
      method: 'POST',
      url: '/api/gallery'
    });
    assert(resNoTokenGallery.status === 401, 'POST /api/gallery without token returns 401');

    const resMalformedToken = await invokeApp(app, {
      method: 'POST',
      url: '/api/courses',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid.jwt.token'
      },
      body: { name: 'Test' }
    });
    assert(resMalformedToken.status === 403, 'Malformed JWT is rejected with 403');

    const expiredToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011', username: 'admin', tokenVersion: 0 },
      process.env.JWT_SECRET,
      { expiresIn: -10 }
    );
    const resExpiredToken = await invokeApp(app, {
      method: 'GET',
      url: '/api/auth/me',
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert(resExpiredToken.status === 401, 'Expired JWT is rejected with 401');

    // 8. JWT secret requirement check (no hardcoded fallback)
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    let missingSecretThrew = false;
    try {
      getJwtSecret();
    } catch {
      missingSecretThrew = true;
    }
    assert(missingSecretThrew, 'getJwtSecret throws when JWT_SECRET is missing (no hardcoded fallback)');

    process.env.JWT_SECRET = 'YOUR_SECURE_RANDOM_JWT_SECRET';
    let placeholderSecretThrew = false;
    try {
      getJwtSecret();
    } catch {
      placeholderSecretThrew = true;
    }
    assert(placeholderSecretThrew, 'getJwtSecret rejects placeholder JWT_SECRET');
    process.env.JWT_SECRET = savedSecret;

    // 9. Password strength validation
    assert(validatePasswordStrength('admin123') !== null, 'Weak password "admin123" is rejected');
    assert(validatePasswordStrength('short1') !== null, 'Short password (<8 chars) is rejected');
    assert(validatePasswordStrength('onlyletters') !== null, 'Password without digits is rejected');
    assert(validatePasswordStrength('CollegeAdmin2026!') === null, 'Strong password passes validation');

    // 10. File magic-byte signature validation
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const fakePng = Buffer.from('not-a-real-png-file-content');
    const validPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj');
    const fakePdf = Buffer.from('<html>not a pdf</html>');
    assert(hasValidImageSignature(validPng, '.png') === true, 'Valid PNG signature accepted');
    assert(hasValidImageSignature(fakePng, '.png') === false, 'Spoofed PNG signature rejected');
    assert(hasValidPdfSignature(validPdf) === true, 'Valid PDF signature accepted');
    assert(hasValidPdfSignature(fakePdf) === false, 'Spoofed PDF signature rejected');

    // 11. ObjectId / legacy ID validation
    assert(isValidResourceId('507f1f77bcf86cd799439011') === true, 'Valid Mongo ObjectId accepted');
    assert(isValidResourceId('12') === true, 'Valid numeric legacy sqlite_id accepted');
    assert(isValidResourceId('invalid-id-abc') === false, 'Malformed resource ID rejected');

    // 12. Production config & Cloudinary config checks
    const origEnv = { ...process.env };
    process.env.CLOUDINARY_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = '123456';
    process.env.CLOUDINARY_API_SECRET = 'YOUR_NEW_ROTATED_CLOUDINARY_API_SECRET';
    assert(isCloudinaryConfigured() === false, 'Placeholder Cloudinary secret is rejected');

    delete process.env.MONGODB_URI;
    delete process.env.FRONTEND_URL;
    const prodErrors = validateProductionConfig();
    assert(prodErrors.length >= 3, 'validateProductionConfig catches missing MongoDB, Cloudinary, and FRONTEND_URL');
    Object.assign(process.env, origEnv);

    // 13. In-memory mocked DB controller & session invalidation tests
    const origReadyState = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
    Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => 1 });

    const origAdminFindById = Admin.findById;
    const origCourseFind = Course.find;
    const origCourseCreate = Course.create;
    const origCourseFindOne = Course.findOne;
    const origNoticeFind = Notice.find;
    const origGalleryFind = Gallery.find;

    try {
      const mockAdminId = '507f1f77bcf86cd799439011';
      Admin.findById = () => ({
        select: async () => ({
          _id: mockAdminId,
          username: 'admin',
          token_version: 2,
          password_changed_at: null
        })
      });

      // Stale tokenVersion (0 vs 2) must be rejected after password change
      const staleToken = jwt.sign(
        { id: mockAdminId, username: 'admin', tokenVersion: 0 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      const resStale = await invokeApp(app, {
        method: 'GET',
        url: '/api/auth/me',
        headers: { Authorization: `Bearer ${staleToken}` }
      });
      assert(resStale.status === 401, 'Token with old tokenVersion is rejected after password change');

      // Current tokenVersion (2) succeeds
      const freshToken = jwt.sign(
        { id: mockAdminId, username: 'admin', tokenVersion: 2 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Invalid ID returns 400 on public & admin routes
      const resBadCourseId = await invokeApp(app, { url: '/api/courses/not-valid-id' });
      assert(resBadCourseId.status === 400, 'GET /api/courses/:id rejects malformed ID with 400');

      const resBadNoticeId = await invokeApp(app, { url: '/api/notices/not-valid-id' });
      assert(resBadNoticeId.status === 400, 'GET /api/notices/:id rejects malformed ID with 400');

      // Authenticated course creation validation & success
      Course.findOne = async () => null;
      Course.create = async (data) => ({ id: '507f1f77bcf86cd799439012', ...data });

      const resBadCourseBody = await invokeApp(app, {
        method: 'POST',
        url: '/api/courses',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`
        },
        body: { name: '   ' }
      });
      assert(resBadCourseBody.status === 400, 'POST /api/courses rejects blank name with 400');

      const resCreateCourse = await invokeApp(app, {
        method: 'POST',
        url: '/api/courses',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`
        },
        body: { name: 'B.A. Economics', duration: '3 Years' }
      });
      assert(
        resCreateCourse.status === 201 && resCreateCourse.json?.course?.name === 'B.A. Economics',
        'Authenticated POST /api/courses succeeds with 201'
      );

      // Public GET routes work without auth
      Course.find = () => ({ sort: async () => [{ id: '1', name: 'B.A.' }] });
      Notice.find = () => ({ sort: async () => [{ id: '1', title: 'Notice 1', notice_date: '2026-08-11' }] });
      Gallery.find = () => ({ sort: async () => [{ id: '1', image_path: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }] });

      const resCourses = await invokeApp(app, { url: '/api/courses' });
      const resNotices = await invokeApp(app, { url: '/api/notices' });
      const resGallery = await invokeApp(app, { url: '/api/gallery' });
      assert(
        resCourses.status === 200 && resNotices.status === 200 && resGallery.status === 200,
        'Public GET endpoints (/courses, /notices, /gallery) return 200'
      );
    } finally {
      Admin.findById = origAdminFindById;
      Course.find = origCourseFind;
      Course.create = origCourseCreate;
      Course.findOne = origCourseFindOne;
      Notice.find = origNoticeFind;
      Gallery.find = origGalleryFind;
      if (origReadyState) {
        Object.defineProperty(mongoose.connection, 'readyState', origReadyState);
      } else {
        delete mongoose.connection.readyState;
      }
    }

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
