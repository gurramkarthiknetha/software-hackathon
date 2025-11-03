import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Determine user role based on email
 * @param {string} email - User's email address
 * @returns {string} - Role: 'admin', 'brand_owner', or 'user'
 */
const determineRole = (email) => {
  if (!email) return 'user';

  const normalizedEmail = email.toLowerCase().trim();

  // Get role-based email lists from environment variables
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const brandOwnerEmails = process.env.BRAND_OWNER_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

  // Check if email matches admin list
  if (adminEmails.includes(normalizedEmail)) {
    return 'admin';
  }

  // Check if email matches brand owner list
  if (brandOwnerEmails.includes(normalizedEmail)) {
    return 'brand_owner';
  }

  // Default role is user
  return 'user';
};

/**
 * Configure Passport.js with Google OAuth Strategy
 */
const configurePassport = () => {
  // Serialize user for session storage
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from Google profile
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const name = profile.displayName;
          const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          // Determine role based on email
          const role = determineRole(email);

          // Check if user already exists by Google ID
          let user = await User.findOne({ googleId });

          if (user) {
            // Update existing user with latest info
            user.name = name;
            user.email = email;
            user.role = role; // Update role in case email lists changed
            user.profilePicture = profilePicture;
            user.lastActive = new Date();
            await user.save();

            console.log(`✅ Existing user logged in: ${email} (${role})`);
            return done(null, user);
          }

          // Check if user exists by email (for migration purposes)
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link Google account to existing user
              user.googleId = googleId;
              user.name = name;
              user.role = role; // Update role
              user.profilePicture = profilePicture;
              user.lastActive = new Date();
              await user.save();

              console.log(`✅ Google account linked to existing user: ${email} (${role})`);
              return done(null, user);
            }
          }

          // Create new user
          const userId = `google_${googleId}`;
          user = new User({
            userId,
            googleId,
            email: email ? email.toLowerCase() : null,
            name,
            role,
            profilePicture,
            preferences: {
              showEcoScoreOverlay: true,
              minEcoScore: 'C',
              notificationsEnabled: true,
              darkMode: false
            },
            footprintData: [],
            savedProducts: [],
            totalCarbonSaved: 0,
            level: 1,
            points: 0,
            lastActive: new Date()
          });

          await user.save();
          console.log(`✅ New user created via Google OAuth: ${email} (${role})`);

          return done(null, user);
        } catch (error) {
          console.error('❌ Error in Google OAuth Strategy:', error);
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
