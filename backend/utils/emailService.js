/**
 * BakeUrCurls — Email Service (Nodemailer)
 *
 * Exports email-sending functions for:
 *   - sendBookingConfirmation
 *   - sendBookingCancellation
 *   - sendQueryReply
 *   - sendAppointmentReminder
 *
 * Uses HTML templates with BakeUrCurls branding.
 */

const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────

/**
 * Create a reusable transporter. In development, falls back to Ethereal
 * (https://ethereal.email) so no real credentials are needed.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── HTML Template Helper ─────────────────────────────────────────────────────

const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9f6f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2d1b0e 0%, #6b3a1f 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #f5e6d3; margin: 0; font-size: 28px; letter-spacing: 2px; }
    .header p { color: #d4a57a; margin: 6px 0 0; font-size: 13px; letter-spacing: 1px; }
    .body { padding: 36px 40px; color: #333; line-height: 1.7; }
    .body h2 { color: #6b3a1f; margin-top: 0; }
    .detail-box { background: #fdf8f4; border-left: 4px solid #c8753b; border-radius: 6px; padding: 20px 24px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ede5db; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 13px; }
    .detail-value { color: #333; font-weight: 600; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-confirmed { background: #d4edda; color: #155724; }
    .badge-cancelled { background: #f8d7da; color: #721c24; }
    .cta-btn { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #c8753b; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
    .footer { background: #f9f6f0; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }
    .footer a { color: #c8753b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌀 BakeUrCurls</h1>
      <p>PREMIUM CURLY HAIR SALON</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BakeUrCurls Salon. All rights reserved.</p>
      <p>Have questions? <a href="mailto:bakeurcurls@gmail.com">bakeurcurls@gmail.com</a></p>
    </div>
  </div>
</body>
</html>
`;

// ─── sendBookingConfirmation ───────────────────────────────────────────────────
/**
 * Send a booking confirmation email.
 * @param {string} toEmail
 * @param {string} toName
 * @param {Object} booking - Populated booking document
 */
const sendBookingConfirmation = async (toEmail, toName, booking) => {
  const transporter = createTransporter();

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const bodyHtml = `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Hi <strong>${toName}</strong>,</p>
    <p>Thank you for choosing BakeUrCurls! Your appointment has been received and confirmed. Here are your booking details:</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">${booking.bookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${booking.service?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Stylist</span>
        <span class="detail-value">${booking.staff?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${booking.timeSlot}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Amount</span>
        <span class="detail-value">$${booking.totalAmount?.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Advance Paid</span>
        <span class="detail-value">$${booking.advanceAmount?.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Balance Due at Salon</span>
        <span class="detail-value">$${(booking.totalAmount - booking.advanceAmount)?.toFixed(2)}</span>
      </div>
    </div>
    <p>Please arrive 5–10 minutes before your appointment. If you need to reschedule or cancel, contact us at least 24 hours in advance.</p>
    <p>We can't wait to see your curls! 🌀</p>
    <p>Warm regards,<br /><strong>The BakeUrCurls Team</strong></p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'BakeUrCurls Salon <noreply@BakeUrCurls.com>',
    to: `${toName} <${toEmail}>`,
    subject: `✅ Booking Confirmed — ${booking.bookingId} | BakeUrCurls`,
    html: baseTemplate('Booking Confirmation — BakeUrCurls', bodyHtml),
  });
};

// ─── sendBookingCancellation ──────────────────────────────────────────────────
/**
 * Send a booking cancellation notification email.
 * @param {string} toEmail
 * @param {string} toName
 * @param {Object} booking - Populated booking document
 */
const sendBookingCancellation = async (toEmail, toName, booking) => {
  const transporter = createTransporter();

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const bodyHtml = `
    <h2>Booking Cancelled</h2>
    <p>Hi <strong>${toName}</strong>,</p>
    <p>We're sorry to inform you that your booking has been cancelled. Here are the details of the cancelled appointment:</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">${booking.bookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${booking.service?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${booking.timeSlot}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="badge badge-cancelled">Cancelled</span></span>
      </div>
      ${booking.cancellationReason ? `
      <div class="detail-row">
        <span class="detail-label">Reason</span>
        <span class="detail-value">${booking.cancellationReason}</span>
      </div>` : ''}
    </div>
    <p>If you have paid an advance, please allow 5–7 business days for the refund to process.</p>
    <p>We'd love to see you again — feel free to book a new appointment anytime.</p>
    <p>Warm regards,<br /><strong>The BakeUrCurls Team</strong></p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'BakeUrCurls Salon <noreply@BakeUrCurls.com>',
    to: `${toName} <${toEmail}>`,
    subject: `❌ Booking Cancelled — ${booking.bookingId} | BakeUrCurls`,
    html: baseTemplate('Booking Cancellation — BakeUrCurls', bodyHtml),
  });
};

// ─── sendQueryReply ───────────────────────────────────────────────────────────
/**
 * Send an email reply to a customer's contact query.
 * @param {string} toEmail
 * @param {string} toName
 * @param {string} originalSubject
 * @param {string} replyText
 */
const sendQueryReply = async (toEmail, toName, originalSubject, replyText) => {
  const transporter = createTransporter();

  const bodyHtml = `
    <h2>We've Replied to Your Query</h2>
    <p>Hi <strong>${toName}</strong>,</p>
    <p>Thank you for reaching out to BakeUrCurls! We've reviewed your message regarding <strong>"${originalSubject}"</strong> and here is our response:</p>
    <div class="detail-box" style="border-left-color: #6b3a1f;">
      <p style="margin: 0; white-space: pre-line; color: #333;">${replyText}</p>
    </div>
    <p>If you have any further questions, please don't hesitate to reply to this email or contact us at <a href="mailto:bakeurcurls@gmail.com" style="color:#c8753b;">bakeurcurls@gmail.com</a>.</p>
    <p>Warm regards,<br /><strong>The BakeUrCurls Team</strong></p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'BakeUrCurls Salon <noreply@BakeUrCurls.com>',
    to: `${toName} <${toEmail}>`,
    subject: `Re: ${originalSubject} | BakeUrCurls`,
    html: baseTemplate('Query Reply — BakeUrCurls', bodyHtml),
  });
};

// ─── sendAppointmentReminder ──────────────────────────────────────────────────
/**
 * Send an appointment reminder email (can be triggered via a cron job).
 * @param {string} toEmail
 * @param {string} toName
 * @param {Object} booking - Populated booking document
 */
const sendAppointmentReminder = async (toEmail, toName, booking) => {
  const transporter = createTransporter();

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const bodyHtml = `
    <h2>Appointment Reminder 🗓️</h2>
    <p>Hi <strong>${toName}</strong>,</p>
    <p>Just a friendly reminder that you have an appointment at BakeUrCurls tomorrow!</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">${booking.bookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${booking.service?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Stylist</span>
        <span class="detail-value">${booking.staff?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${booking.timeSlot}</span>
      </div>
    </div>
    <p><strong>Tips to prepare your curls:</strong></p>
    <ul>
      <li>Come with detangled, freshly washed hair if possible</li>
      <li>Avoid heavy products the day before</li>
      <li>Arrive 5–10 minutes early</li>
    </ul>
    <p>We look forward to seeing you! 🌀</p>
    <p>Warm regards,<br /><strong>The BakeUrCurls Team</strong></p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'BakeUrCurls Salon <noreply@BakeUrCurls.com>',
    to: `${toName} <${toEmail}>`,
    subject: `⏰ Reminder: Your BakeUrCurls appointment tomorrow — ${booking.bookingId}`,
    html: baseTemplate('Appointment Reminder — BakeUrCurls', bodyHtml),
  });
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendQueryReply,
  sendAppointmentReminder,
};
