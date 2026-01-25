# S3 bucket dashboard

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/thorstens-projects-a471c665/v0-s3-bucket-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/cWyXLXLx3TM)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

This Next.js application displays an S3 bucket storage dashboard that reads data from a CSV file at build time, making it perfect for static site hosting on GitHub Pages.

## Can this app be hosted on GitHub Pages?

**YES!** This Next.js app is fully compatible with GitHub Pages because:

- ✅ **Static Data Generation**: All S3 bucket data is read from `public/s3-data.csv` at build time
- ✅ **No Server Required**: The app uses Next.js static export (`output: 'export'`) to generate pure HTML/CSS/JS
- ✅ **Build-Time Processing**: All data parsing and calculations happen during the build process
- ✅ **No API Routes**: No server-side endpoints that require a Node.js runtime

The application processes the CSV data during `next build` and generates static HTML pages that can be served from any static hosting service, including GitHub Pages.

## Deployment

### Deploy to GitHub Pages

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

#### Setup Steps:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Under "Build and deployment", set Source to "GitHub Actions"

2. **Update basePath** (if needed) in `next.config.mjs`:
   ```js
   basePath: '/s3-bucket-dashboard',  // Uncomment and use your repo name
   ```
   This is only needed if your repository name is not the root domain.

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

4. The GitHub Actions workflow will automatically:
   - Install dependencies
   - Build the static site
   - Deploy to GitHub Pages

Your site will be available at: `https://<username>.github.io/<repository-name>/`

### Deploy to Vercel

Your project is also live at:

**[https://vercel.com/thorstens-projects-a471c665/v0-s3-bucket-dashboard](https://vercel.com/thorstens-projects-a471c665/v0-s3-bucket-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/cWyXLXLx3TM](https://v0.app/chat/cWyXLXLx3TM)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# The static site will be in the 'out' directory
```

## Data Source

The dashboard reads S3 bucket data from `public/s3-data.csv`. Update this file with your S3 bucket metrics to see the data reflected in the dashboard after the next build.

### CSV Format:
```csv
s3BucketName,date,spaceUsed
production-assets,2026-01-25,524288000000
production-assets,2026-01-24,521953280000
```

- `s3BucketName`: Name of the S3 bucket
- `date`: Date in YYYY-MM-DD format
- `spaceUsed`: Space used in bytes
