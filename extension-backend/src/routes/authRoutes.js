import express from 'express';
import passport from 'passport';
import {
  googleCallback,
  logout,
  getCurrentUser,
  verifyToken
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback URL
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=login_failed`,
    session: true
  }),
  googleCallback
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/logout (alternative)
 * @desc    Logout user (GET method for convenience)
 * @access  Private
 */
router.get('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', requireAuth, verifyToken);

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    user: req.user ? {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    } : null
  });
});

export default router;
