const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB Database
 * Supports local MongoDB, MongoDB Atlas, and automatic persistent fallback on port 27017 for MongoDB Compass.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookloop';

  try {
    // Attempt direct connection to existing MongoDB service if already running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}`);
    console.log(`[MongoDB Compass URL]: ${uri}`);
  } catch (err) {
    console.warn(`[MongoDB] Direct connection to '${uri}' failed: ${err.message}`);
    console.log('[MongoDB] Starting local MongoDB instance on standard port 27017 for MongoDB Compass...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');

      // Attempt to bind to standard port 27017 for easy one-click MongoDB Compass connection
      try {
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'bookloop'
          }
        });
      } catch (portErr) {
        console.log(`[MongoDB] Port 27017 unavailable (${portErr.message}), fallback to dynamic port...`);
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'bookloop'
          }
        });
      }

      const memUri = mongoMemoryServer.getUri() + 'bookloop';
      await mongoose.connect(memUri);

      const compassUri = mongoMemoryServer.getUri();
      console.log(`=======================================================`);
      console.log(` [MongoDB Compass Connection Info]`);
      console.log(` Connection URI : ${compassUri}`);
      console.log(` Database Name  : bookloop`);
      console.log(` Collections    : users, books, requests`);
      console.log(`=======================================================`);
    } catch (fallbackError) {
      console.error('[MongoDB] Fatal: Could not establish MongoDB connection:', fallbackError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
