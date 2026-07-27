const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Keep a pool of 10 connections — reused across requests instead of
      // opening a new TCP connection every time.
      maxPoolSize: 10,
      // Don't wait more than 5 s to get a connection from the pool.
      serverSelectionTimeoutMS: 5000,
      // Drop a socket that has been idle for 45 s.
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.error('   → Waiting 5 seconds before retrying connection...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
