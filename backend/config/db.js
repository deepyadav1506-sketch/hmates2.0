const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelsdb';
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      retryWrites: true,
      bufferCommands: false, // Disable buffering on first connect
    };

    console.log(`🔄 Connecting to MongoDB: ${connStr.split('@')[0]}...`);

    await mongoose.connect(connStr, options);
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (retries > 0) {
      console.log(`🔄 Retrying connection... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 5000 * (6 - retries))); // Backoff 5s,10s,...
      return connectDB(retries - 1);
    }
    console.error('💥 Failed to connect after retries. Server continuing without DB.');
    process.exit(1); // Exit if critical
  }
};

module.exports = connectDB;

