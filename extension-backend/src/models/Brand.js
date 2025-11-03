import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  logo: String,
  website: String,
  description: String,
  
  // Sustainability Ratings
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  transparencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Certifications
  certifications: [{
    name: String,
    type: {
      type: String,
      enum: ['Fairtrade', 'B Corp', 'Organic', 'Carbon Neutral', 'Cruelty Free', 'Other']
    },
    verified: Boolean,
    verificationUrl: String,
    date: Date
  }],
  
  // Environmental Initiatives
  initiatives: [{
    title: String,
    description: String,
    startDate: Date,
    url: String
  }],
  
  // Reports & Disclosures
  reports: [{
    title: String,
    type: {
      type: String,
      enum: ['ESG Report', 'Sustainability Report', 'Carbon Disclosure', 'Other']
    },
    year: Number,
    url: String
  }],
  
  // Statistics
  carbonNeutralGoal: {
    year: Number,
    status: {
      type: String,
      enum: ['Achieved', 'In Progress', 'Planned', 'None']
    }
  },
  
  renewableEnergyPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  recycledMaterialsPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // User feedback
  userRatings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

brandSchema.index({ name: 'text' });

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
