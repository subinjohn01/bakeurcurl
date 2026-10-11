/**
 * BakeUrCurl — MongoDB Connection
 * Mongoose connection with exponential-backoff retry logic.
 */

const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Attempt to connect to MongoDB. Retries up to MAX_RETRIES times
 * with an increasing delay between each attempt.
 *
 * @param {number} attempt - Current retry attempt (1-indexed)
 */
const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 deprecates most options; only keep relevant ones
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      `\n✅ MongoDB Connected: ${conn.connection.host} (attempt ${attempt})`
    );

    // Attach event listeners only once on first successful connection
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect…');
    });
  } catch (error) {
    console.error(
      `❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
    );

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt; // Exponential-ish back-off
      console.log(`   Retrying in ${delay / 1000}s…`);
      setTimeout(() => connectDB(attempt + 1), delay);
    } else {
      console.error('🛑 Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
