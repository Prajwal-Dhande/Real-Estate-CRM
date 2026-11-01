const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'estateiq_default_secret_key_2026';

/**
 * Verify JWT token and attach user to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development mode, allow guest/demo browsing fallback
      if (process.env.NODE_ENV !== 'production') {
        const demoUser = await User.findOne({ role: 'admin' }) || { _id: 'guest', role: 'admin', name: 'Admin Demo' };
        req.user = demoUser;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Authentication token required (format: Bearer <token>)'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
}

/**
 * Role-based access control (RBAC) middleware
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role "${req.user.role}" does not have permission`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};

