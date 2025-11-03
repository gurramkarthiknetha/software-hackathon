#!/bin/bash

# 🌿 Sustainable Alternatives API Test Script
# Run this to test all the new API endpoints

echo "🚀 Testing Sustainable Product Alternatives API..."
echo "==============================================="

BASE_URL="http://localhost:5001/api"

echo ""
echo "1️⃣ Testing Alternatives Search..."
curl -s "${BASE_URL}/alternatives?productName=water%20bottle&currentScore=45&limit=3" | jq '.'

echo ""
echo "2️⃣ Testing Eco Product Search..."
curl -s "${BASE_URL}/alternatives/search?query=sustainable%20water%20bottle&minScore=70&limit=5" | jq '.'

echo ""
echo "3️⃣ Testing Alternative Choice Recording..."
curl -s -X POST "${BASE_URL}/alternatives/choose" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "originalProduct": {
      "name": "Regular Plastic Bottle",
      "ecoScore": 45
    },
    "chosenAlternative": {
      "title": "Bamboo Water Bottle - Eco Friendly",
      "ecoScore": 85,
      "co2Footprint": 3.2,
      "link": "https://amazon.com/bamboo-bottle"
    },
    "co2Saved": 4.8,
    "ecoCoinsEarned": 10
  }' | jq '.'

echo ""
echo "4️⃣ Testing User Statistics..."
curl -s "${BASE_URL}/alternatives/stats/test_user_123" | jq '.'

echo ""
echo "5️⃣ Testing Health Check..."
curl -s "${BASE_URL}/health" | jq '.'

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Load the Chrome extension from extension-frontend/dist"
echo "   2. Visit demo-products.html or any Amazon product page"
echo "   3. Click 'Find Better Alternatives' in the eco-badge"
echo "   4. Choose an alternative to earn EcoCoins!"
echo ""
echo "📊 Dashboard: Check the extension popup for updated stats"
echo "💰 EcoCoins: Earned through sustainable choices"
echo "🌱 Impact: Track your CO₂ savings in real-time"