/**
 * BakeUrCurl — Query Routes
 *
 * POST   /api/queries                 Submit contact query (public)
 * GET    /api/queries                 Get all queries (admin/staff)
 * GET    /api/queries/:id             Get query by ID (admin/staff)
 * POST   /api/queries/:id/reply       Reply to query via email (admin/staff)
 * PATCH  /api/queries/:id/read        Mark query as read (admin/staff)
 */

const express = require('express');
const {
  submitQuery,
  getQueries,
  getQueryById,
  replyToQuery,
  markAsRead,
} = require('../controllers/queryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/', submitQuery);

// Admin / Staff only
router.get('/', protect, authorize('admin', 'staff'), getQueries);
router.get('/:id', protect, authorize('admin', 'staff'), getQueryById);
router.post('/:id/reply', protect, authorize('admin', 'staff'), replyToQuery);
router.patch('/:id/read', protect, authorize('admin', 'staff'), markAsRead);

module.exports = router;
