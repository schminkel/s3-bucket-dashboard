# S3 Bucket Dashboard

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-222?style=for-the-badge&logo=github)](https://schminkel.github.io/s3-bucket-dashboard/)
[![Auto-Updated Daily](https://img.shields.io/badge/Auto--Updated-Daily-success?style=for-the-badge&logo=github-actions)](https://github.com/schminkel/s3-bucket-dashboard/actions)
[![S3 Bucket Size Monitor](https://img.shields.io/github/actions/workflow/status/schminkel/s3-bucket-dashboard/s3-bucket-monitor.yml?style=for-the-badge&logo=github-actions&label=S3%20Monitor)](https://github.com/schminkel/s3-bucket-dashboard/actions/workflows/s3-bucket-monitor.yml)

## Overview

This Next.js application displays an S3 bucket storage dashboard with automated daily data updates. The app reads data from a CSV file at build time, making it perfect for static site hosting on GitHub Pages.

**Key Features:**
- 📊 **Real-time Monitoring**: Track S3 bucket sizes and growth trends
- 🔄 **Automated Updates**: GitHub Actions fetches fresh data daily from AWS S3
- 🚀 **Static Site**: Fully static Next.js export deployed on GitHub Pages
- 📈 **Visual Analytics**: Interactive charts showing storage trends over time

> **Note:** The initial version of this dashboard was created with [v0.dev](https://v0.dev), an AI-powered UI generation tool.

## Automated Data Updates

This project includes a **GitHub Actions workflow** that automatically monitors your S3 buckets and updates the dashboard daily:

- **Data Collection Schedule**: Runs daily at midnight UTC (00:00)
- **Process**: Fetches current S3 bucket sizes from AWS using the AWS SDK
- **Updates**: Automatically commits updated data to `public/s3-data.csv`
- **Deployment Schedule**: Runs daily at 1 AM UTC (01:00), one hour after data collection
- **Result**: GitHub Pages is automatically rebuilt and deployed with the latest data

The data collection workflow is defined in [`.github/workflows/s3-bucket-monitor.yml`](.github/workflows/s3-bucket-monitor.yml) and requires the following secrets to be configured:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

The deployment workflow is defined in [`.github/workflows/nextjs.yml`](.github/workflows/nextjs.yml) and runs automatically on a schedule, on pushes to main, or can be triggered manually.

## Deployment

### Deployed on GitHub Pages

This application is deployed on **GitHub Pages** and automatically updates:
- When changes are pushed to the `main` branch
- Daily at 1 AM UTC to deploy updated S3 bucket data

**Live Site**: `https://<username>.github.io/s3-bucket-dashboard/`

### Deploy to GitHub Pages

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch and on a daily schedule at 1 AM UTC.

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

### Additional Deployment: Vercel

This application is additionally deployed on **Vercel** for alternative hosting:

**Vercel Site**: [https://vercel.com/thorstens-projects-a471c665/v0-s3-bucket-dashboard](https://vercel.com/thorstens-projects-a471c665/v0-s3-bucket-dashboard)

Both deployments use the same codebase and benefit from the automated daily S3 data updates.

## Why GitHub Pages?

This Next.js app is fully compatible with GitHub Pages because:

- ✅ **Static Data Generation**: All S3 bucket data is read from `public/s3-data.csv` at build time
- ✅ **No Server Required**: The app uses Next.js static export (`output: 'export'`) to generate pure HTML/CSS/JS
- ✅ **Build-Time Processing**: All data parsing and calculations happen during the build process
- ✅ **No API Routes**: No server-side endpoints that require a Node.js runtime

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

The dashboard reads S3 bucket data from `public/s3-data.csv`. This file is **automatically updated daily** by the GitHub Actions workflow, which:

1. Connects to AWS using configured credentials
2. Fetches current size data for all monitored S3 buckets
3. Appends new entries to the CSV file
4. Commits and pushes the changes to the repository
5. Triggers GitHub Pages to rebuild and redeploy the dashboard

### Manual Updates

You can also manually update the CSV file or trigger the workflow from the Actions tab in GitHub.

### CSV Format:
```csv
s3BucketName,date,spaceUsed
production-assets,2026-01-25,524288000000
production-assets,2026-01-24,521953280000
```

- `s3BucketName`: Name of the S3 bucket
- `date`: Date in YYYY-MM-DD format
- `spaceUsed`: Space used in bytes
