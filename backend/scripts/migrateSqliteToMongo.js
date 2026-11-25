/**
 * SQLite to MongoDB Atlas Migration Script
 * Rama Kishore Singh Degree College
 *
 * Safely migrates tables (admin, courses, notices, gallery) from college.db
 * to MongoDB Atlas without data loss, with idempotency, Cloudinary media upload,
 * verification counts, and non-zero exit on failures.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const Gallery = require('../models/Gallery');
const { isCloudinaryConfigured, uploadStreamToCloudinary } = require('../config/cloudinary');

const sqliteDbPath = process.env.DATABASE_PATH
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.resolve(__dirname, '..', 'college.db');

const allowLocalMedia = process.argv.includes('--allow-local-media');

async function runMigration() {
  console.log('====================================================');
  console.log('RKSD COLLEGE: SQLITE TO MONGODB ATLAS MIGRATION');
  console.log('====================================================');

  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`ERROR: SQLite database file not found at: ${sqliteDbPath}`);
    process.exit(1);
  }
  console.log(`Source SQLite Database: ${sqliteDbPath}`);

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.includes('YOUR_')) {
    console.error('ERROR: MONGODB_URI is not configured with a valid connection string in backend/.env.');
    process.exit(1);
  }

  const cloudinaryReady = isCloudinaryConfigured();
  if (!cloudinaryReady && !allowLocalMedia) {
    console.error('ERROR: Cloudinary credentials are not configured.');
    console.error('Production migration requires Cloudinary so migrated images/PDFs are permanently stored.');
    console.error('Configure CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env,');
    console.error('or pass --allow-local-media for offline local testing only.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to MongoDB host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }

  const sqliteDb = await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  }).catch((err) => {
    console.error('Failed to open SQLite database:', err.message);
    process.exit(1);
  });

  const querySqlite = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  console.log(`Cloudinary Status: ${cloudinaryReady ? 'Configured (Media auto-upload enabled)' : 'Skipped (--allow-local-media)'}`);

  const summary = {
    admin: { read: 0, migrated: 0, skipped: 0, mongoTotal: 0 },
    courses: { read: 0, migrated: 0, skipped: 0, mongoTotal: 0 },
    notices: { read: 0, migrated: 0, skipped: 0, mongoTotal: 0 },
    gallery: { read: 0, migrated: 0, skipped: 0, mongoTotal: 0 }
  };

  let hadError = false;

  try {
    // 1. Migrate Admin
    console.log('\n--- Migrating Admin Accounts ---');
    const adminRows = await querySqlite('SELECT * FROM admin ORDER BY id ASC');
    summary.admin.read = adminRows.length;

    for (const row of adminRows) {
      const cleanUsername = String(row.username || '').trim().toLowerCase();
      const existing = await Admin.findOne({
        $or: [{ sqlite_id: row.id }, { username: cleanUsername }]
      });

      if (existing) {
        console.log(`Admin "${cleanUsername}" (SQLite ID: ${row.id}) already exists in MongoDB. Preserving existing record.`);
        summary.admin.skipped++;
      } else {
        await Admin.create({
          username: cleanUsername,
          password_hash: row.password_hash,
          sqlite_id: row.id,
          created_at: row.created_at ? new Date(row.created_at) : new Date()
        });
        console.log(`Migrated admin: "${cleanUsername}" (SQLite ID: ${row.id})`);
        summary.admin.migrated++;
      }
    }

    // 2. Migrate Courses
    console.log('\n--- Migrating Degree Courses ---');
    const courseRows = await querySqlite('SELECT * FROM courses ORDER BY id ASC');
    summary.courses.read = courseRows.length;

    for (const row of courseRows) {
      const existing = await Course.findOne({
        $or: [{ sqlite_id: row.id }, { name: row.name }]
      });

      if (existing) {
        console.log(`Course "${row.name}" (SQLite ID: ${row.id}) already exists in MongoDB. Skipping.`);
        summary.courses.skipped++;
      } else {
        await Course.create({
          name: row.name,
          duration: row.duration || '3 Years Degree Course',
          eligibility: row.eligibility || '',
          description: row.description || '',
          sqlite_id: row.id,
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        });
        console.log(`Migrated course: "${row.name}" (SQLite ID: ${row.id})`);
        summary.courses.migrated++;
      }
    }

    // 3. Migrate Notices
    console.log('\n--- Migrating Notices & Circulars ---');
    const noticeRows = await querySqlite('SELECT * FROM notices ORDER BY id ASC');
    summary.notices.read = noticeRows.length;

    for (const row of noticeRows) {
      const existing = await Notice.findOne({ sqlite_id: row.id });

      if (existing) {
        console.log(`Notice "${row.title}" (SQLite ID: ${row.id}) already exists in MongoDB. Skipping.`);
        summary.notices.skipped++;
      } else {
        let pdfPath = row.pdf_path || null;
        let cloudinaryPublicId = null;

        if (pdfPath && !pdfPath.startsWith('http') && cloudinaryReady) {
          const localPdfFullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\/+/, ''));
          if (!fs.existsSync(localPdfFullPath)) {
            throw new Error(`Missing local notice PDF referenced by SQLite notice ID ${row.id}: ${localPdfFullPath}`);
          }
          console.log(`Uploading notice PDF to Cloudinary: ${path.basename(localPdfFullPath)}...`);
          const fileBuffer = fs.readFileSync(localPdfFullPath);
          const uploadRes = await uploadStreamToCloudinary(fileBuffer, {
            folder: 'rksd_college/notices',
            resource_type: 'raw',
            public_id: `notice-${row.id}-${crypto.randomBytes(4).toString('hex')}.pdf`
          });
          pdfPath = uploadRes.secure_url;
          cloudinaryPublicId = uploadRes.public_id;
          console.log(`Uploaded notice PDF to Cloudinary: ${pdfPath}`);
        }

        await Notice.create({
          title: row.title,
          description: row.description || '',
          pdf_path: pdfPath,
          cloudinary_public_id: cloudinaryPublicId,
          notice_date: row.notice_date,
          sqlite_id: row.id,
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        });
        console.log(`Migrated notice: "${row.title}" (SQLite ID: ${row.id})`);
        summary.notices.migrated++;
      }
    }

    // 4. Migrate Gallery
    console.log('\n--- Migrating Gallery Photographs ---');
    const galleryRows = await querySqlite('SELECT * FROM gallery ORDER BY id ASC');
    summary.gallery.read = galleryRows.length;

    for (const row of galleryRows) {
      const existing = await Gallery.findOne({ sqlite_id: row.id });

      if (existing) {
        console.log(`Gallery item "${row.title}" (SQLite ID: ${row.id}) already exists in MongoDB. Skipping.`);
        summary.gallery.skipped++;
      } else {
        let imagePath = row.image_path;
        let cloudinaryPublicId = null;

        if (imagePath && !imagePath.startsWith('http') && cloudinaryReady) {
          const localImgFullPath = path.resolve(__dirname, '..', imagePath.replace(/^\/+/, ''));
          if (!fs.existsSync(localImgFullPath)) {
            throw new Error(`Missing local gallery image referenced by SQLite gallery ID ${row.id}: ${localImgFullPath}`);
          }
          console.log(`Uploading gallery image to Cloudinary: ${path.basename(localImgFullPath)}...`);
          const fileBuffer = fs.readFileSync(localImgFullPath);
          const uploadRes = await uploadStreamToCloudinary(fileBuffer, {
            folder: 'rksd_college/gallery',
            resource_type: 'image',
            public_id: `gallery-${row.id}-${crypto.randomBytes(4).toString('hex')}`
          });
          imagePath = uploadRes.secure_url;
          cloudinaryPublicId = uploadRes.public_id;
          console.log(`Uploaded gallery image to Cloudinary: ${imagePath}`);
        }

        await Gallery.create({
          image_path: imagePath,
          cloudinary_public_id: cloudinaryPublicId,
          title: row.title || 'Campus Photograph',
          category: row.category || 'Campus',
          sqlite_id: row.id,
          created_at: row.created_at ? new Date(row.created_at) : new Date()
        });
        console.log(`Migrated gallery item: "${row.title}" (SQLite ID: ${row.id})`);
        summary.gallery.migrated++;
      }
    }

    // 5. Verify actual MongoDB counts
    summary.admin.mongoTotal = await Admin.countDocuments();
    summary.courses.mongoTotal = await Course.countDocuments();
    summary.notices.mongoTotal = await Notice.countDocuments();
    summary.gallery.mongoTotal = await Gallery.countDocuments();

    console.log('\n====================================================');
    console.log('MIGRATION VERIFICATION REPORT');
    console.log('====================================================');
    console.table(summary);

    for (const [key, stats] of Object.entries(summary)) {
      if (stats.mongoTotal < stats.read) {
        console.error(`ERROR: Verification failed for "${key}": MongoDB has ${stats.mongoTotal} records, expected at least ${stats.read}.`);
        hadError = true;
      }
    }

    if (!hadError) {
      console.log('Note: Original SQLite file "college.db" has been preserved intact as backup.');
      console.log('Migration process completed and verified successfully!');
    }
  } catch (error) {
    hadError = true;
    console.error('Migration failed with error:', error.message);
  } finally {
    sqliteDb.close();
    await mongoose.connection.close();
    console.log('Database connections closed.');
    if (hadError) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
