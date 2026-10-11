/**
 * BakeUrCurl — JWT Authentication Middleware
 *
 * Exports:
 *   protect       — verifies JWT; attaches req.user
 *   authorize()   — role-based access control gate
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * -------
 * Middleware that validates the Bearer JWT from the Authorization header.
 * On success, the decoded user document is attached to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header (Bearer <token>) or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — no token provided.',
    });
  }

  try {
    // Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (catches deleted/deactivated accounts)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised — user no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again.'
        : 'Not authorised — invalid token.';

    return res.status(401).json({ success: false, message });
  }
};

/**
 * authorize
 * ---------
 * Role-based access control gate. Must be used AFTER `protect`.
 *
 * Usage:  router.delete('/:id', protect, authorize('admin'), deleteUser)
 *
 * @param  {...string} roles - Allowed roles: 'customer' | 'staff' | 'admin'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — role '${req.user.role}' is not permitted to perform this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
