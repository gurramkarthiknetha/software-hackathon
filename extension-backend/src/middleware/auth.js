import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object from database
 * @returns {string} - Signed JWT token
 */
export const generateToken = (user) => {
  const payload = {
    userId: user.userId,
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

/**
 * Middleware: Require Authentication
 * Validates JWT token and attaches user to req.user
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookies as fallback
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.userId;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * Middleware: Require Specific Role(s)
 * Use after requireAuth middleware
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 * @returns {Function} - Express middleware function
 * 
 * @example
 * app.get('/api/admin/dashboard', requireAuth, requireRole(['admin']), handler);
 * app.get('/api/brand/products', requireAuth, requireRole(['brand_owner', 'admin']), handler);
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Use requireAuth middleware first.'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.userRole}`
      });
    }

    next();
  };
};

/**
 * Middleware: Optional Authentication
 * Attaches user to req.user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
      req.userId = user.userId;
      req.userRole = user.role;
    }

    next();
  } catch (error) {
    // If token verification fails, continue without authentication
    next();
  }
};

/**
 * Helper: Check if user has permission
 * @param {Object} user - User object
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export const hasPermission = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Helper: Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Helper: Check if user is brand owner or admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isBrandOwnerOrAdmin = (user) => {
  return user && (user.role === 'brand_owner' || user.role === 'admin');
};
