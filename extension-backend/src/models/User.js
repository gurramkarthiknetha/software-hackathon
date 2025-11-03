import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: String,
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },

  // 🔐 OAuth Fields
  googleId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  profilePicture: String,

  // 🔐 Role-Based Access
  role: {
    type: String,
    enum: ['user', 'brand_owner', 'admin'], 
    default: 'user'
  },

  // User Preferences
  preferences: {
    showEcoScoreOverlay: { type: Boolean, default: true },
    minEcoScore: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
      default: 'C'
    },
    prioritizeCertifications: [{ type: String }],
    preferredCategories: [{ type: String }],
    notificationsEnabled: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false }
  },

  // Consumption Tracking
  footprintData: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    brand: String,
    ecoScore: String,
    carbonFootprint: Number,
    date: { type: Date, default: Date.now },
    action: {
      type: String,
      enum: ['viewed', 'clicked', 'purchased'],
      default: 'viewed'
    }
  }],

  // Saved/Favorite Products
  savedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Analytics
  totalCarbonSaved: { type: Number, default: 0 },
  totalRecyclableProducts: { type: Number, default: 0 },
  sustainableChoicesCount: { type: Number, default: 0 },

  // Gamification
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedDate: Date
  }],
  level: { type: Number, default: 1 },
  points: { type: Number, default: 0 },

  // Metadata
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update lastActive on any activity
userSchema.methods.recordActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

// Calculate total carbon saved
userSchema.methods.calculateCarbonSaved = function() {
  const total = this.footprintData.reduce((sum, item) => {
    return sum + (item.carbonFootprint || 0);
  }, 0);
  this.totalCarbonSaved = total;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
