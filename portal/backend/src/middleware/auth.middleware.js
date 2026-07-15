const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Verify JWT and attach user to req */
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive)
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Optionally attach user if a valid token is present — does NOT block unauthenticated
 * requests. Used on routes that are public by default but behave differently for
 * authenticated callers (e.g. /api/auth/register allows self-registration but
 * requires superadmin to create admin/superadmin accounts).
 */
exports.optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) req.user = user;
    }
  } catch {
    // ignore — unauthenticated is fine for this middleware
  }
  next();
};

/** Role-based access control — pass allowed roles */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied for role: ${req.user.role}` });
  }
  next();
};
