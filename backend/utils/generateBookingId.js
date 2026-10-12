/**
 * BakeUrCurl — Booking ID Generator
 *
 * Generates unique, human-readable booking IDs in the format:
 *   CURL-YYYY-XXXX  (e.g. CURL-2024-A3F7)
 *
 * Ensures uniqueness by checking against the Booking collection.
 */

const mongoose = require('mongoose');

/**
 * Generate a random 4-character alphanumeric string (uppercase).
 * @returns {string}
 */
const randomSuffix = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit ambiguous chars: 0,O,1,I
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * generateBookingId
 * -----------------
 * Creates a unique booking ID of the form CURL-YYYY-XXXX.
 * Retries up to 10 times if a collision is detected.
 *
 * @returns {Promise<string>} e.g. "CURL-2024-A3F7"
 */
const generateBookingId = async () => {
  const year = new Date().getFullYear();
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const bookingId = `CURL-${year}-${randomSuffix()}`;

    // Check for collision in the database
    const Booking = mongoose.models.Booking;
    if (Booking) {
      const existing = await Booking.findOne({ bookingId }).lean();
      if (!existing) {
        return bookingId;
      }
    } else {
      return bookingId;
    }

    // Collision detected — retry with a new suffix
    console.warn(`Booking ID collision on attempt ${attempt}: ${bookingId}. Retrying…`);
  }

  // Extremely unlikely fallback — use timestamp-based ID
  return `CURL-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
};

module.exports = generateBookingId;
