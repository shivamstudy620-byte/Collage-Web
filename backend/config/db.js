const mongoose = require('mongoose');

// Fail fast if database is disconnected instead of buffering queries indefinitely
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  const isProd = process.env.NODE_ENV === 'production';

  if (!mongoURI || mongoURI.includes('YOUR_')) {
    const errorMsg = 'FATAL: MONGODB_URI environment variable is not defined or contains a placeholder.';
    if (isProd) {
      console.error(errorMsg);
      throw new Error(errorMsg);
    } else {
      console.warn(errorMsg);
      console.warn('Configure MONGODB_URI in backend/.env for database operations.');
      return null;
    }
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully.');
    return conn;
  } catch (err) {
    console.error('MongoDB connection failure:', err.message);
    if (isProd) {
      throw err;
    }
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Waiting for automatic reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDbConnected,
  mongoose
};
