# 🚀 Deployment Checklist

## Pre-Deployment Steps

### Backend Preparation

- [ ] **Environment Variables**
  - [ ] Update `.env` with production MongoDB URI
  - [ ] Set strong JWT_SECRET
  - [ ] Set NODE_ENV=production
  - [ ] Configure allowed CORS origins

- [ ] **Database Setup**
  - [ ] Create production MongoDB database (Atlas recommended)
  - [ ] Run seed script: `npm run seed`
  - [ ] Verify data in database
  - [ ] Set up database backups

- [ ] **Security**
  - [ ] Add rate limiting (express-rate-limit)
  - [ ] Add helmet.js for security headers
  - [ ] Implement JWT authentication (optional)
  - [ ] Add input validation (express-validator)
  - [ ] Enable HTTPS

- [ ] **Code Quality**
  - [ ] Run linter
  - [ ] Fix all warnings
  - [ ] Remove console.logs
  - [ ] Add error monitoring (Sentry)

### Frontend Preparation

- [ ] **Extension Icons**
  - [ ] Create icon16.png (16x16px)
  - [ ] Create icon48.png (48x48px)
  - [ ] Create icon128.png (128x128px)
  - [ ] Place in `public/icons/` folder

- [ ] **Configuration**
  - [ ] Update API_BASE_URL to production backend
  - [ ] Update manifest.json description
  - [ ] Update version number
  - [ ] Add proper extension permissions

- [ ] **Build**
  - [ ] Run `npm run build`
  - [ ] Test the built extension
  - [ ] Verify all assets load correctly
  - [ ] Check bundle size

- [ ] **Testing**
  - [ ] Test on multiple product pages
  - [ ] Test all features in popup
  - [ ] Test on different screen sizes
  - [ ] Cross-browser testing (if applicable)

## Deployment Steps

### Backend Deployment (Choose One)

#### Option 1: Heroku
\`\`\`bash
# Install Heroku CLI
# Login: heroku login

# Create app
heroku create ecoshop-api

# Set environment variables
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix extension-backend heroku main

# Run seed
heroku run npm run seed
\`\`\`

#### Option 2: Railway
\`\`\`bash
# Install Railway CLI
# Login: railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
\`\`\`

#### Option 3: Render
- Connect GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`
- Add environment variables in dashboard

#### Option 4: DigitalOcean/AWS/GCP
- Set up Node.js droplet/instance
- Install Node.js and MongoDB
- Clone repository
- Install dependencies
- Configure PM2 or similar process manager
- Set up reverse proxy (Nginx)
- Configure SSL certificate

### Frontend Deployment

#### Option 1: Chrome Web Store (Recommended)

1. **Prepare Submission**
   - [ ] Create developer account ($5 one-time fee)
   - [ ] Prepare promotional images (1280x800px)
   - [ ] Write detailed description
   - [ ] Prepare screenshots (1280x800px or 640x400px)
   - [ ] Create privacy policy page

2. **Upload Extension**
   - [ ] Go to Chrome Web Store Developer Dashboard
   - [ ] Click "New Item"
   - [ ] Upload ZIP of `dist` folder
   - [ ] Fill in all required fields
   - [ ] Submit for review

3. **Review Process**
   - [ ] Wait for review (typically 1-3 days)
   - [ ] Address any issues
   - [ ] Publish once approved

#### Option 2: Manual Distribution

1. **Create ZIP**
   \`\`\`bash
   cd extension-frontend/dist
   zip -r ecoshop-extension.zip .
   \`\`\`

2. **Share with users**
   - Provide installation instructions
   - Users load via "Load unpacked" in Developer mode

## Post-Deployment

### Monitoring

- [ ] **Backend Monitoring**
  - [ ] Set up uptime monitoring (UptimeRobot)
  - [ ] Configure error tracking (Sentry)
  - [ ] Set up logging (Winston/Pino)
  - [ ] Monitor API response times

- [ ] **Extension Monitoring**
  - [ ] Monitor Chrome Web Store reviews
  - [ ] Track usage statistics
  - [ ] Monitor error reports
  - [ ] Set up user feedback channel

### Maintenance

- [ ] **Regular Updates**
  - [ ] Update sustainability data weekly
  - [ ] Add new products to database
  - [ ] Update brand information
  - [ ] Fix reported bugs

- [ ] **User Support**
  - [ ] Create support email
  - [ ] Set up FAQ page
  - [ ] Respond to reviews
  - [ ] Create user documentation

## Production Checklist

### Backend (API)

- [ ] Running on production server
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database connected and seeded
- [ ] Environment variables set
- [ ] Logging configured
- [ ] Error handling working
- [ ] Rate limiting active

### Frontend (Extension)

- [ ] Built and tested
- [ ] Icons added
- [ ] API URL pointing to production
- [ ] Manifest updated
- [ ] Permissions correct
- [ ] Content scripts working
- [ ] Background worker functional
- [ ] All features tested

### Documentation

- [ ] README.md complete
- [ ] API documentation available
- [ ] User guide written
- [ ] Privacy policy published
- [ ] Terms of service created

### Legal & Compliance

- [ ] Privacy policy complies with regulations
- [ ] Data collection disclosed
- [ ] User consent implemented
- [ ] GDPR compliance (if applicable)
- [ ] Trademark check completed

## Quick Production URLs

Update these in your code:

\`\`\`javascript
// In content.js and background.js
const API_BASE_URL = 'https://your-production-api.com/api';

// In manifest.json
"host_permissions": [
  "https://your-production-api.com/*"
]
\`\`\`

## Testing in Production

1. **Smoke Tests**
   - [ ] Extension loads without errors
   - [ ] Badge appears on product pages
   - [ ] API calls succeed
   - [ ] Popup opens correctly
   - [ ] Settings save properly

2. **Full Test Suite**
   - [ ] Test all major features
   - [ ] Test edge cases
   - [ ] Test error scenarios
   - [ ] Performance testing

3. **User Acceptance Testing**
   - [ ] Get feedback from beta users
   - [ ] Fix critical issues
   - [ ] Iterate based on feedback

## Rollback Plan

If something goes wrong:

1. **Backend Issues**
   - Revert to previous deployment
   - Check logs for errors
   - Restore database backup if needed

2. **Extension Issues**
   - Remove from Chrome Web Store temporarily
   - Fix critical bugs
   - Submit updated version
   - Notify users via update notes

## Success Metrics

Track these after deployment:

- [ ] Number of active users
- [ ] Daily active users (DAU)
- [ ] Products analyzed per day
- [ ] API response times
- [ ] Error rates
- [ ] User ratings/reviews
- [ ] Feature usage statistics

## Next Steps After Deployment

1. **Marketing**
   - Share on social media
   - Write blog post
   - Submit to product directories
   - Create demo video

2. **Growth**
   - Add more e-commerce sites
   - Expand product database
   - Add more features
   - Improve ML models

3. **Monetization** (Optional)
   - Premium features
   - Affiliate partnerships
   - Sponsored sustainable brands
   - Carbon offset programs

---

Good luck with your deployment! 🚀🌱
