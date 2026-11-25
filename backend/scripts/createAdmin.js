/**
 * Secure One-Time Admin Initialization Script
 * Rama Kishore Singh Degree College
 *
 * Usage:
 *   Interactive: npm run create-admin
 *   Non-interactive: ADMIN_USERNAME=<user> ADMIN_PASSWORD=<strong-password> npm run create-admin
 *
 * Refuses to use weak/default passwords and preserves existing migrated admin accounts.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const readline = require('readline');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { validatePasswordStrength } = require('../controllers/authController');

const promptInput = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function createInitialAdmin() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.includes('YOUR_')) {
    console.error('ERROR: MONGODB_URI is not configured in backend/.env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });

    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      console.log(`INFO: ${existingCount} admin account(s) already exist in MongoDB. No changes made.`);
      process.exit(0);
    }

    let username = process.env.ADMIN_USERNAME;
    let password = process.env.ADMIN_PASSWORD;

    if (!username) {
      username = await promptInput('Enter initial admin username (3-50 chars, lowercase letters/numbers/_.-): ');
    }
    if (!password) {
      password = await promptInput('Enter strong initial admin password (min 8 chars, letters + numbers): ');
    }

    const cleanUsername = String(username || '').trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 50 || !/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      console.error('ERROR: Invalid username format.');
      process.exit(1);
    }

    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      console.error(`ERROR: ${pwdError}`);
      process.exit(1);
    }

    await Admin.create({
      username: cleanUsername,
      password_hash: Admin.hashPassword(password),
      token_version: 0
    });

    console.log(`SUCCESS: Initial admin account "${cleanUsername}" created securely.`);
  } catch (err) {
    console.error('ERROR creating admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  createInitialAdmin();
}

module.exports = createInitialAdmin;
