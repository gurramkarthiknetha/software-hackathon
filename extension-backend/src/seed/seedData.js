import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

dotenv.config();

const brands = [
  {
    name: 'Patagonia',
    description: 'Outdoor clothing company committed to environmental sustainability',
    sustainabilityScore: 95,
    transparencyScore: 98,
    certifications: [
      { name: 'B Corp', type: 'B Corp', verified: true, date: new Date('2012-01-01') },
      { name: 'Fair Trade', type: 'Fairtrade', verified: true, date: new Date('2014-01-01') }
    ],
    carbonNeutralGoal: { year: 2025, status: 'In Progress' },
    renewableEnergyPercentage: 80,
    recycledMaterialsPercentage: 68
  },
  {
    name: 'Seventh Generation',
    description: 'Plant-based cleaning and household products',
    sustainabilityScore: 88,
    transparencyScore: 92,
    certifications: [
      { name: 'B Corp', type: 'B Corp', verified: true, date: new Date('2015-01-01') },
      { name: 'USDA Organic', type: 'Organic', verified: true, date: new Date('2010-01-01') }
    ],
    carbonNeutralGoal: { year: 2030, status: 'Planned' },
    renewableEnergyPercentage: 75,
    recycledMaterialsPercentage: 100
  },
  {
    name: 'Allbirds',
    description: 'Sustainable footwear made from natural materials',
    sustainabilityScore: 90,
    transparencyScore: 95,
    certifications: [
      { name: 'B Corp', type: 'B Corp', verified: true, date: new Date('2016-01-01') },
      { name: 'Carbon Neutral', type: 'Carbon Neutral', verified: true, date: new Date('2019-01-01') }
    ],
    carbonNeutralGoal: { year: 2019, status: 'Achieved' },
    renewableEnergyPercentage: 90,
    recycledMaterialsPercentage: 60
  },
  {
    name: 'Generic Brand X',
    description: 'Standard consumer goods manufacturer',
    sustainabilityScore: 35,
    transparencyScore: 40,
    certifications: [],
    carbonNeutralGoal: { year: 2050, status: 'Planned' },
    renewableEnergyPercentage: 20,
    recycledMaterialsPercentage: 15
  }
];

const products = [
  {
    name: 'Eco-Friendly Reusable Water Bottle',
    brand: 'Patagonia',
    category: 'Home & Kitchen',
    carbonScore: 92,
    recyclability: 95,
    ethicsScore: 90,
    packagingScore: 88,
    carbonFootprint: { value: 2.5, unit: 'kg CO2e' },
    waterUsage: { value: 15, unit: 'liters' },
    certifications: [
      { name: 'BPA-Free', verified: true },
      { name: 'Made from Recycled Materials', verified: true }
    ]
  },
  {
    name: 'Organic Cotton T-Shirt',
    brand: 'Patagonia',
    category: 'Clothing',
    carbonScore: 85,
    recyclability: 80,
    ethicsScore: 95,
    packagingScore: 85,
    carbonFootprint: { value: 5.2, unit: 'kg CO2e' },
    waterUsage: { value: 120, unit: 'liters' },
    certifications: [
      { name: 'Fair Trade Certified', verified: true },
      { name: 'Organic Cotton', verified: true }
    ]
  },
  {
    name: 'Plant-Based Laundry Detergent',
    brand: 'Seventh Generation',
    category: 'Home & Kitchen',
    carbonScore: 88,
    recyclability: 92,
    ethicsScore: 85,
    packagingScore: 90,
    carbonFootprint: { value: 1.8, unit: 'kg CO2e' },
    waterUsage: { value: 8, unit: 'liters' },
    certifications: [
      { name: 'USDA Certified Biobased', verified: true },
      { name: 'EPA Safer Choice', verified: true }
    ]
  },
  {
    name: 'Sustainable Wool Running Shoes',
    brand: 'Allbirds',
    category: 'Shoes',
    carbonScore: 87,
    recyclability: 75,
    ethicsScore: 92,
    packagingScore: 88,
    carbonFootprint: { value: 7.6, unit: 'kg CO2e' },
    waterUsage: { value: 45, unit: 'liters' },
    certifications: [
      { name: 'Carbon Neutral Product', verified: true },
      { name: 'ZQ Merino', verified: true }
    ]
  },
  {
    name: 'Bamboo Toothbrush Set',
    brand: 'Seventh Generation',
    category: 'Personal Care',
    carbonScore: 90,
    recyclability: 88,
    ethicsScore: 85,
    packagingScore: 95,
    carbonFootprint: { value: 0.5, unit: 'kg CO2e' },
    waterUsage: { value: 3, unit: 'liters' },
    certifications: [
      { name: 'Biodegradable', verified: true },
      { name: 'Vegan', verified: true }
    ]
  },
  {
    name: 'Recycled Plastic Backpack',
    brand: 'Patagonia',
    category: 'Accessories',
    carbonScore: 82,
    recyclability: 90,
    ethicsScore: 88,
    packagingScore: 85,
    carbonFootprint: { value: 12.3, unit: 'kg CO2e' },
    waterUsage: { value: 35, unit: 'liters' },
    certifications: [
      { name: 'Made from Recycled Ocean Plastic', verified: true },
      { name: 'Fair Trade Certified', verified: true }
    ]
  },
  {
    name: 'Standard Plastic Water Bottle',
    brand: 'Generic Brand X',
    category: 'Home & Kitchen',
    carbonScore: 25,
    recyclability: 40,
    ethicsScore: 30,
    packagingScore: 20,
    carbonFootprint: { value: 18.5, unit: 'kg CO2e' },
    waterUsage: { value: 85, unit: 'liters' },
    certifications: []
  },
  {
    name: 'Conventional Cotton Shirt',
    brand: 'Generic Brand X',
    category: 'Clothing',
    carbonScore: 35,
    recyclability: 45,
    ethicsScore: 40,
    packagingScore: 30,
    carbonFootprint: { value: 22.8, unit: 'kg CO2e' },
    waterUsage: { value: 2700, unit: 'liters' },
    certifications: []
  },
  {
    name: 'Solar-Powered Phone Charger',
    brand: 'Patagonia',
    category: 'Electronics',
    carbonScore: 78,
    recyclability: 70,
    ethicsScore: 82,
    packagingScore: 75,
    carbonFootprint: { value: 15.2, unit: 'kg CO2e' },
    waterUsage: { value: 28, unit: 'liters' },
    certifications: [
      { name: 'Energy Star', verified: true }
    ]
  },
  {
    name: 'Compostable Food Storage Bags',
    brand: 'Seventh Generation',
    category: 'Home & Kitchen',
    carbonScore: 93,
    recyclability: 95,
    ethicsScore: 88,
    packagingScore: 92,
    carbonFootprint: { value: 0.8, unit: 'kg CO2e' },
    waterUsage: { value: 5, unit: 'liters' },
    certifications: [
      { name: 'ASTM D6400 Certified Compostable', verified: true },
      { name: 'Plant-Based', verified: true }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert brands
    const insertedBrands = await Brand.insertMany(brands);
    console.log(`✅ Inserted ${insertedBrands.length} brands`);

    // Map brand names to IDs
    const brandMap = {};
    insertedBrands.forEach(brand => {
      brandMap[brand.name] = brand._id;
    });

    // Add brand references to products
    const productsWithBrandRefs = products.map(product => ({
      ...product,
      brandRef: brandMap[product.brand]
    }));

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithBrandRefs);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Add alternatives (greener options)
    const ecoBottle = insertedProducts.find(p => p.name.includes('Eco-Friendly Reusable'));
    const standardBottle = insertedProducts.find(p => p.name.includes('Standard Plastic'));
    
    if (standardBottle && ecoBottle) {
      standardBottle.alternatives.push(ecoBottle._id);
      await standardBottle.save();
    }

    const organicShirt = insertedProducts.find(p => p.name.includes('Organic Cotton'));
    const conventionalShirt = insertedProducts.find(p => p.name.includes('Conventional Cotton'));
    
    if (conventionalShirt && organicShirt) {
      conventionalShirt.alternatives.push(organicShirt._id);
      await conventionalShirt.save();
    }

    console.log('✅ Added product alternatives');
    console.log('\n🎉 Database seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
