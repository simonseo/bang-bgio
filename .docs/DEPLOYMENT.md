# Bang! Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:3000` (or next available port).

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/test/unit/moves.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Production Build

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build Locally

```bash
npm run preview
```

### 3. Test Production Build

Before deploying, verify:
- All assets load correctly
- Game initializes properly
- No console errors
- All card images display (or placeholders work)

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel deploy
   ```

3. **Production Deployment:**
   ```bash
   vercel deploy --prod
   ```

**Vercel Configuration** (vercel.json):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy
   ```

3. **Production Deployment:**
   ```bash
   netlify deploy --prod
   ```

**Netlify Configuration** (netlify.toml):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Static Hosting (GitHub Pages, AWS S3, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist/` directory contents to your hosting provider.

3. Configure your host to:
   - Serve `index.html` for all routes (SPA fallback)
   - Use gzip/brotli compression
   - Set appropriate cache headers

## Environment Variables

Currently, the project doesn't use environment variables. If you add any:

1. Create `.env` file (DO NOT commit):
   ```
   VITE_API_URL=https://api.example.com
   ```

2. Access in code:
   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL;
   ```

3. Set in deployment platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment

## Multiplayer Server (Optional)

For networked multiplayer (not implemented yet):

### 1. Run Server Locally

```bash
npm run server
```

Server runs on port 8000.

### 2. Deploy Server

**Option A: Heroku**
```bash
heroku create bang-game-server
git push heroku main
```

**Option B: Railway**
- Connect GitHub repository
- Set build command: `npm install`
- Set start command: `node server.cjs`

**Option C: DigitalOcean/AWS/GCP**
- Deploy as Node.js app
- Expose port 8000
- Set up reverse proxy (nginx/Apache)

## Performance Optimization

### 1. Asset Optimization

- **Images:** Use WebP format for card images
- **Lazy Loading:** Implement for card images
- **Code Splitting:** Already handled by Vite

### 2. Caching Strategy

```nginx
# Example nginx configuration
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    expires -1;
    add_header Cache-Control "no-cache";
}
```

### 3. CDN

Consider using a CDN for static assets:
- Cloudflare (free tier available)
- AWS CloudFront
- Vercel Edge Network (included)

## Monitoring

### Recommended Tools

1. **Error Tracking:**
   - Sentry
   - Rollbar
   - Bugsnag

2. **Analytics:**
   - Google Analytics
   - Plausible (privacy-friendly)
   - PostHog (open-source)

3. **Performance:**
   - Lighthouse CI
   - WebPageTest
   - Chrome User Experience Report

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 8000 (server)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (dev)
lsof -ti:3000 | xargs kill -9
```

### Assets Not Loading

- Check `base` in `vite.config.ts` matches your deployment path
- Verify all asset imports use relative paths
- Check browser console for CORS errors

## Security Checklist

- [ ] No sensitive data in client code
- [ ] API keys in environment variables (not committed)
- [ ] HTTPS enabled in production
- [ ] CSP headers configured
- [ ] Rate limiting on server endpoints (if applicable)
- [ ] Input validation on all user data

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --run

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Post-Deployment Verification

1. **Smoke Tests:**
   - Game loads
   - Can create 4-player game
   - Cards display correctly
   - Can play a turn

2. **Browser Testing:**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile browsers (iOS Safari, Chrome Mobile)

3. **Performance:**
   - Lighthouse score > 90
   - Time to Interactive < 3s
   - First Contentful Paint < 1.5s

## Rollback Plan

If issues occur:

1. **Vercel/Netlify:**
   - Use platform UI to rollback to previous deployment

2. **Manual:**
   ```bash
   git revert HEAD
   git push
   ```

3. **Critical Issues:**
   - Deploy maintenance page
   - Fix issue locally
   - Deploy hotfix

## Support

For deployment issues:
- Check project GitHub Issues
- Review platform documentation (Vercel/Netlify)
- Test locally first with `npm run preview`
