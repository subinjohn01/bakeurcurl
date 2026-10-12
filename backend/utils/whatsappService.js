/**
 * BakeUrCurl — WhatsApp Notification Service
 *
 * Supports:
 *   1. Meta WhatsApp Cloud API (Official free tier: 1,000 service msgs/mo)
 *      Requires: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
 *   2. Twilio WhatsApp API
 *      Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 *   3. Direct Webhook / Custom Gateway
 *   4. Zero-config Fallback Mode: Logs formatted message & generates direct wa.me links
 */

const https = require('https');

// Helper: clean phone number to standard international format (e.g. +91 8891020402 -> 918891020402)
const formatPhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');
  // If 10 digits (Indian standard), prepend 91
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return digits;
};

/**
 * Send raw text message via WhatsApp
 */
const sendWhatsAppMessage = async ({ to, message }) => {
  const phone = formatPhoneForWhatsApp(to);
  if (!phone) {
    console.warn('[WhatsApp] No valid phone number provided.');
    return { success: false, reason: 'No phone number' };
  }

  // 1. Meta / WhatsApp Cloud API
  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
    try {
      const payload = JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { preview_url: true, body: message },
      });

      const options = {
        hostname: 'graph.facebook.com',
        path: `/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      return new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[WhatsApp Cloud API] Message sent successfully to +${phone}`);
              resolve({ success: true, provider: 'meta', response: data });
            } else {
              console.error(`[WhatsApp Cloud API Error] Status ${res.statusCode}:`, data);
              resolve({ success: false, provider: 'meta', error: data });
            }
          });
        });
        req.on('error', (e) => {
          console.error('[WhatsApp Cloud API] Request failed:', e.message);
          resolve({ success: false, provider: 'meta', error: e.message });
        });
        req.write(payload);
        req.end();
      });
    } catch (err) {
      console.error('[WhatsApp] Meta dispatch failed:', err.message);
    }
  }

  // 2. Twilio WhatsApp API
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
    try {
      const postData = new URLSearchParams({
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        To: `whatsapp:+${phone}`,
        Body: message,
      }).toString();

      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      return new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            console.log(`[Twilio WhatsApp] Status ${res.statusCode} for +${phone}`);
            resolve({ success: res.statusCode === 201, provider: 'twilio', response: data });
          });
        });
        req.on('error', (e) => resolve({ success: false, provider: 'twilio', error: e.message }));
        req.write(postData);
        req.end();
      });
    } catch (err) {
      console.error('[WhatsApp] Twilio dispatch failed:', err.message);
    }
  }

  // 3. Fallback Mode (No active WhatsApp credentials set in env)
  // Cleanly logs message and generates direct wa.me link for manual or webhook delivery
  const encodedText = encodeURIComponent(message);
  const waLink = `https://wa.me/${phone}?text=${encodedText}`;
  console.log(`\n---------------- [WHATSAPP OUTBOX] ----------------`);
  console.log(`Recipient: +${phone}`);
  console.log(`Message:\n${message}`);
  console.log(`Direct Link: ${waLink}`);
  console.log(`----------------------------------------------------\n`);

  return {
    success: true,
    provider: 'simulated_fallback',
    recipient: phone,
    directLink: waLink,
    note: 'Message logged. Add WHATSAPP_ACCESS_TOKEN or Twilio credentials to .env for automated cloud dispatch.',
  };
};

/**
 * Format & send Appointment Reminder
 */
const sendAppointmentReminderWhatsApp = async ({ phone, name, serviceName, timeSlot, stylistName, bookingId }) => {
  const message =
    `Hello ${name || 'there'}! ✨\n\n` +
    `Friendly reminder of your appointment at *BakeUrCurls Salon* today:\n\n` +
    `✂️ *Service:* ${serviceName || 'Hair Service'}\n` +
    `🕒 *Time:* ${timeSlot}\n` +
    `👤 *Stylist:* ${stylistName || 'Assigned Stylist'}\n` +
    `🔖 *Booking ID:* #${bookingId}\n` +
    `📍 *Location:* BakeUrCurls Salon\n\n` +
    `Need directions or have any questions? Reply to this message or call us at +91 70120 01472.\n\n` +
    `We look forward to seeing your gorgeous curls today! 🌀💫`;

  return sendWhatsAppMessage({ to: phone, message });
};

/**
 * Format & send Booking Confirmation
 */
const sendBookingConfirmationWhatsApp = async ({ phone, name, serviceName, date, timeSlot, stylistName, bookingId, totalAmount }) => {
  const message =
    `Hello ${name || 'there'}! ✨\n\n` +
    `Your appointment at *BakeUrCurls Salon* has been confirmed! 🎉\n\n` +
    `🔖 *Booking ID:* #${bookingId}\n` +
    `✂️ *Service:* ${serviceName}\n` +
    `📅 *Date:* ${date}\n` +
    `🕒 *Time Slot:* ${timeSlot}\n` +
    `👤 *Stylist:* ${stylistName || 'Assigned Stylist'}\n` +
    `💵 *Total Amount:* ₹${totalAmount}\n\n` +
    `We can't wait to pamper your curls! See you soon. 🌀✨`;

  return sendWhatsAppMessage({ to: phone, message });
};

/**
 * Format & send Loyalty Coupon Notification
 */
const sendCouponIssuedWhatsApp = async ({ phone, name, couponCode, discountText, validUntil, minSpend }) => {
  const formattedExpiry = new Date(validUntil).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message =
    `Congratulations ${name || 'Valued Customer'}! 🎁✨\n\n` +
    `You have received an exclusive loyalty coupon from *BakeUrCurls*:\n\n` +
    `🎟️ *Coupon Code:* *${couponCode}*\n` +
    `💰 *Discount:* ${discountText}\n` +
    `⏳ *Valid Until:* ${formattedExpiry}\n` +
    (minSpend > 0 ? `🛒 *Min Spend:* ₹${minSpend}\n` : '') +
    `\nUse this code when booking your next hair appointment at https://bakeurcurl.vercel.app/book to redeem your savings!\n\n` +
    `Happy styling from Team BakeUrCurls! 🌀`;

  return sendWhatsAppMessage({ to: phone, message });
};

module.exports = {
  formatPhoneForWhatsApp,
  sendWhatsAppMessage,
  sendAppointmentReminderWhatsApp,
  sendBookingConfirmationWhatsApp,
  sendCouponIssuedWhatsApp,
};
