import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    unique: true,
    sparse: true
  },
  imageUrl: String,
  
  // Product Physical Properties
  energyConsumption: {
    type: Number,
    min: 0,
    default: null,
    description: 'Annual energy consumption in kWh'
  },
  weight: {
    type: Number,
    min: 0,
    default: null,
    description: 'Product weight in kg'
  },
  
  // Sustainability Scores (0-100)
  carbonScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  recyclability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  ethicsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  packagingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Overall eco-score (calculated)
  ecoScore: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    default: 'C'
  },
  ecoScoreNumeric: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Environmental Impact (from Climatiq API)
  carbonFootprint: {
    value: Number,
    unit: {
      type: String,
      default: 'kg CO2e'
    },
    method: String,
    isFallback: {
      type: Boolean,
      default: false
    },
    lastCalculated: Date
  },
  waterUsage: {
    value: Number,
    unit: {
      type: String,
      default: 'liters'
    }
  },
  
  // Certifications & Sources
  certifications: [{
    name: String,
    verified: {
      type: Boolean,
      default: false
    },
    url: String
  }],
  
  verifiedSources: [{
    name: String,
    url: String,
    date: Date
  }],
  
  // Brand reference
  brandRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  
  // Alternative products (greener options)
  alternatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0
  },
  userRatings: [{
    userId: String,
    rating: Number,
    comment: String,
    date: Date
  }]
}, {
  timestamps: true
});

// Calculate eco-score before saving
productSchema.pre('save', function(next) {
  const avgScore = (
    this.carbonScore + 
    this.recyclability + 
    this.ethicsScore + 
    this.packagingScore
  ) / 4;
  
  this.ecoScoreNumeric = Math.round(avgScore);
  
  if (avgScore >= 80) this.ecoScore = 'A';
  else if (avgScore >= 65) this.ecoScore = 'B';
  else if (avgScore >= 50) this.ecoScore = 'C';
  else if (avgScore >= 35) this.ecoScore = 'D';
  else this.ecoScore = 'E';
  
  next();
});

// Indexes for faster search
productSchema.index({ name: 'text', brand: 'text', category: 'text' });
productSchema.index({ ecoScore: 1, category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
