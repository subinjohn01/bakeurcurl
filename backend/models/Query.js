/**
 * BakeUrCurl — Query (Contact) Model
 *
 * Captures messages submitted via the public contact form.
 * Staff / admin can reply, which triggers an email to the sender.
 */

const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address.'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address.',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject.'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters.'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message.'],
      maxlength: [2000, 'Message cannot exceed 2000 characters.'],
    },

    // ── Status lifecycle: new → read → replied ─────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['new', 'read', 'replied'],
        message: "Status must be 'new', 'read', or 'replied'.",
      },
      default: 'new',
    },

    // Staff reply content (email is also sent)
    reply: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ email: 1 });

const Query = mongoose.model('Query', querySchema);
module.exports = Query;
