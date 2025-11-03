import { generateToken } from '../middleware/auth.js';

/**
 * Handle successful Google OAuth callback
 * Generates JWT token and redirects to frontend with token
 */
export const googleCallback = async (req, res) => {
  try {
    // User is attached to req.user by Passport after successful authentication
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=authentication_failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user);

    // Option 1: Set token in HTTP-only cookie (most secure)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Option 2: Redirect to frontend with token in URL (for SPA/Extension)
    // Frontend can extract token from URL and store it
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&userId=${req.user.userId}&role=${req.user.role}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?error=callback_failed`);
  }
};

/**
 * Handle logout
 * Clears session and cookie
 */
export const logout = (req, res) => {
  try {
    // Clear token cookie
    res.clearCookie('token');

    // Logout from Passport session
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get current authenticated user
 * Returns user profile if authenticated
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User is attached by requireAuth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Return user data (excluding sensitive fields)
    const userData = {
      userId: req.user.userId,
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      level: req.user.level,
      points: req.user.points,
      totalCarbonSaved: req.user.totalCarbonSaved,
      preferences: req.user.preferences,
      lastActive: req.user.lastActive
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

/**
 * Verify token endpoint
 * Checks if provided token is valid
 */
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, requireAuth middleware has validated the token
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};
