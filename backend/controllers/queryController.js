/**
 * BakeUrCurl — Query Controller
 *
 * Functions:
 *   submitQuery    POST   /api/queries            (public)
 *   getQueries     GET    /api/queries            (admin/staff)
 *   getQueryById   GET    /api/queries/:id        (admin/staff)
 *   replyToQuery   POST   /api/queries/:id/reply  (admin/staff — sends email)
 *   markAsRead     PATCH  /api/queries/:id/read   (admin/staff)
 */

const Query = require('../models/Query');
const { sendQueryReply } = require('../utils/emailService');

// ─── submitQuery ──────────────────────────────────────────────────────────────
/**
 * @desc    Submit a public contact/query form
 * @route   POST /api/queries
 * @access  Public
 */
const submitQuery = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.',
      });
    }

    const query = await Query.create({ name, email, phone: phone || '', subject, message });

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted. We will get back to you shortly!',
      queryId: query._id,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getQueries ───────────────────────────────────────────────────────────────
/**
 * @desc    Get all queries with optional filtering
 * @route   GET /api/queries?status=&search=&page=&limit=
 * @access  Private — admin, staff
 */
const getQueries = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [queries, total] = await Promise.all([
      Query.find(filter)
        .populate('repliedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Query.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      queries,
    });
  } catch (err) {
    next(err);
  }
};

// ─── getQueryById ─────────────────────────────────────────────────────────────
/**
 * @desc    Get a single query by ID
 * @route   GET /api/queries/:id
 * @access  Private — admin, staff
 */
const getQueryById = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id).populate('repliedBy', 'name email');

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    // Auto-mark as read when first opened
    if (query.status === 'new') {
      query.status = 'read';
      await query.save();
    }

    res.status(200).json({ success: true, query });
  } catch (err) {
    next(err);
  }
};

// ─── replyToQuery ─────────────────────────────────────────────────────────────
/**
 * @desc    Reply to a customer query (saves reply and sends email)
 * @route   POST /api/queries/:id/reply
 * @access  Private — admin, staff
 */
const replyToQuery = async (req, res, next) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    // Save reply
    query.reply = reply.trim();
    query.status = 'replied';
    query.repliedAt = new Date();
    query.repliedBy = req.user._id;
    await query.save();

    // Send reply email (non-blocking)
    try {
      await sendQueryReply(query.email, query.name, query.subject, reply.trim());
    } catch (emailErr) {
      console.error('Query reply email failed (non-fatal):', emailErr.message);
    }

    const populated = await Query.findById(query._id).populate('repliedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      query: populated,
    });
  } catch (err) {
    next(err);
  }
};

// ─── markAsRead ───────────────────────────────────────────────────────────────
/**
 * @desc    Mark a query as read
 * @route   PATCH /api/queries/:id/read
 * @access  Private — admin, staff
 */
const markAsRead = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    if (query.status === 'replied') {
      return res.status(400).json({
        success: false,
        message: 'Query has already been replied to.',
      });
    }

    query.status = 'read';
    await query.save();

    res.status(200).json({ success: true, message: 'Query marked as read.', query });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitQuery, getQueries, getQueryById, replyToQuery, markAsRead };
