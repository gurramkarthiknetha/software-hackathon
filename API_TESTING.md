# 🧪 API Testing Guide

Test all API endpoints using curl, Postman, or your browser.

## Health Check

\`\`\`bash
curl http://localhost:5000/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "message": "Eco Shopping API is running",
  "timestamp": "2024-11-03T..."
}
\`\`\`

## Product Endpoints

### 1. Get Product by Name

\`\`\`bash
curl "http://localhost:5000/api/products?name=Eco-Friendly%20Reusable%20Water%20Bottle&brand=Patagonia"
\`\`\`

### 2. Search Products

\`\`\`bash
curl "http://localhost:5000/api/products/search?category=Clothing&minScore=B"
\`\`\`

### 3. Get Recommendations

\`\`\`bash
curl "http://localhost:5000/api/products/recommendations?category=Home%20%26%20Kitchen&currentScore=50&limit=3"
\`\`\`

### 4. Add New Product

\`\`\`bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sustainable Hemp T-Shirt",
    "brand": "EcoWear",
    "category": "Clothing",
    "carbonScore": 88,
    "recyclability": 85,
    "ethicsScore": 92,
    "packagingScore": 90,
    "carbonFootprint": {
      "value": 3.2,
      "unit": "kg CO2e"
    }
  }'
\`\`\`

### 5. Rate Product

\`\`\`bash
curl -X POST http://localhost:5000/api/products/rate \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "userId": "test_user_123",
    "rating": 5,
    "comment": "Excellent sustainable product!"
  }'
\`\`\`

## User Endpoints

### 1. Get or Create User

\`\`\`bash
curl http://localhost:5000/api/users/test_user_123
\`\`\`

### 2. Get User Footprint

\`\`\`bash
curl "http://localhost:5000/api/users/test_user_123/footprint?limit=10"
\`\`\`

### 3. Record Activity

\`\`\`bash
curl -X POST http://localhost:5000/api/users/test_user_123/activity \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Eco-Friendly Water Bottle",
    "brand": "Patagonia",
    "ecoScore": "A",
    "carbonFootprint": 2.5,
    "action": "viewed"
  }'
\`\`\`

### 4. Update Preferences

\`\`\`bash
curl -X PUT http://localhost:5000/api/users/test_user_123/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "showEcoScoreOverlay": true,
    "minEcoScore": "B",
    "notificationsEnabled": true,
    "darkMode": false
  }'
\`\`\`

### 5. Save Product

\`\`\`bash
curl -X POST http://localhost:5000/api/users/test_user_123/save-product \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID"
  }'
\`\`\`

### 6. Get Saved Products

\`\`\`bash
curl http://localhost:5000/api/users/test_user_123/saved-products
\`\`\`

## Brand Endpoints

### 1. Get All Brands

\`\`\`bash
curl "http://localhost:5000/api/brands?limit=10&sort=-sustainabilityScore"
\`\`\`

### 2. Get Brand by Name

\`\`\`bash
curl "http://localhost:5000/api/brands/search?name=Patagonia"
\`\`\`

### 3. Create/Update Brand

\`\`\`bash
curl -X POST http://localhost:5000/api/brands \
  -H "Content-Type: application/json" \
  -d '{
    "name": "EcoTech Solutions",
    "sustainabilityScore": 92,
    "transparencyScore": 88,
    "certifications": [
      {
        "name": "B Corp",
        "type": "B Corp",
        "verified": true,
        "date": "2023-01-01"
      }
    ],
    "carbonNeutralGoal": {
      "year": 2025,
      "status": "In Progress"
    }
  }'
\`\`\`

### 4. Rate Brand

\`\`\`bash
curl -X POST http://localhost:5000/api/brands/rate \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "YOUR_BRAND_ID",
    "rating": 5
  }'
\`\`\`

## Postman Collection

Import this JSON into Postman for easy testing:

\`\`\`json
{
  "info": {
    "name": "EcoShop API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Get Products",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/products?name=Eco-Friendly Reusable Water Bottle",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "products"],
          "query": [
            {
              "key": "name",
              "value": "Eco-Friendly Reusable Water Bottle"
            }
          ]
        }
      }
    }
  ]
}
\`\`\`

## Expected Response Codes

- **200 OK**: Successful GET request
- **201 Created**: Successful POST request (resource created)
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Testing Tips

1. **Use Postman**: Import the collection above for easier testing
2. **Check Database**: Use MongoDB Compass to verify data
3. **Watch Logs**: Check backend terminal for request logs
4. **Test Incrementally**: Test each endpoint individually
5. **Save IDs**: Copy product/user/brand IDs for dependent tests

## Sample Test Flow

1. Check health endpoint
2. Get all brands
3. Search for products
4. Create a new user
5. Record user activity
6. Get user footprint
7. Get recommendations based on category
8. Rate a product
9. Save a product to favorites
10. Get saved products

---

Happy Testing! 🧪
