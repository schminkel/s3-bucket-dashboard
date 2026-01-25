# S3 Bucket Size Monitoring

## Overview

This GitHub Action automatically monitors the storage usage of all AWS S3 buckets in your account. It runs daily at midnight UTC, calculates the size of each bucket, stores the data in a CSV file, and commits the changes back to the repository. The system maintains a rolling 30-day history of bucket sizes for tracking and visualization purposes.

## Features

- 🔄 Automated daily monitoring at midnight UTC
- 📊 Tracks individual bucket sizes and total storage across all buckets
- 📝 Stores historical data in CSV format for easy analysis
- 🗑️ Automatically prunes data older than 30 days
- ✅ Handles errors gracefully with detailed logging
- 🤖 Automatic git commits with timestamps

## Setup Instructions

### 1. AWS IAM Configuration

Create an IAM user with programmatic access and attach a policy with the following minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::*",
        "arn:aws:s3:::*/*"
      ]
    }
  ]
}
```

**Note:** These permissions only allow **read access** to S3 buckets and do not permit any modifications.

### 2. Add GitHub Secrets

Navigate to your repository settings and add the following secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these three secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | Primary AWS region | `us-east-1` or `eu-west-1` |

### 3. Install Dependencies

The workflow uses the AWS SDK for JavaScript v3. Ensure your `package.json` includes:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x.x"
  },
  "type": "module"
}
```

Run `pnpm install` to install the required dependencies.

### 4. Initial CSV File

The workflow will automatically create `public/s3-data.csv` on the first run. You can also create it manually with the following structure:

```csv
s3BucketName,date,spaceUsed
```

## CSV File Format

The monitoring data is stored in `public/s3-data.csv` with the following structure:

### Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `s3BucketName` | String | Name of the S3 bucket, or "all" for total | `my-bucket`, `all` |
| `date` | String (YYYY-MM-DD) | Date when the measurement was taken | `2026-01-25` |
| `spaceUsed` | Integer (bytes) | Total size of the bucket in bytes | `1048576` (1 MB) |

### Example CSV Output

```csv
s3BucketName,date,spaceUsed
my-photos-bucket,2026-01-25,524288000
my-documents-bucket,2026-01-25,104857600
my-backups-bucket,2026-01-25,2147483648
all,2026-01-25,2776629248
my-photos-bucket,2026-01-26,530000000
my-documents-bucket,2026-01-26,105000000
my-backups-bucket,2026-01-26,2150000000
all,2026-01-26,2785000000
```

### Data Interpretation

- Each bucket gets one row per day with its current size
- The special bucket name `all` represents the sum of all buckets
- Sizes are in bytes (divide by 1,048,576 for MB, by 1,073,741,824 for GB)
- Data is appended daily, so you'll see a time series for each bucket

## Data Retention

The system automatically maintains a **30-day rolling window** of historical data:

- Data older than 30 days is automatically deleted
- This happens each time the workflow runs
- Keeps the CSV file size manageable
- Provides sufficient history for trend analysis

## Schedule

The workflow runs automatically according to the following schedule:

- **Daily at 00:00 UTC** (midnight UTC)
- Can also be triggered manually (see Manual Execution below)

To convert UTC to your local timezone:
- PST (Pacific): 00:00 UTC = 4:00 PM PST (previous day)
- EST (Eastern): 00:00 UTC = 7:00 PM EST (previous day)  
- CET (Central European): 00:00 UTC = 1:00 AM CET
- JST (Japan): 00:00 UTC = 9:00 AM JST

## Manual Execution

You can manually trigger the workflow without waiting for the scheduled run:

1. Go to **Actions** tab in your GitHub repository
2. Select **S3 Bucket Size Monitor** from the workflows list
3. Click **Run workflow** button on the right
4. Select the branch (usually `main`)
5. Click **Run workflow**

The workflow will execute immediately and you can monitor its progress in real-time.

## Troubleshooting

### Workflow Fails with "AWS credentials not found"

**Problem:** The workflow cannot access AWS credentials.

**Solutions:**
- Verify that all three secrets are added: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`
- Check that secret names are spelled exactly as shown (case-sensitive)
- Ensure secrets are added at the repository level, not environment level

### Workflow Fails with "Access Denied" or "Forbidden"

**Problem:** The AWS IAM user doesn't have sufficient permissions.

**Solutions:**
- Review the IAM policy attached to your user
- Ensure it includes `s3:ListAllMyBuckets`, `s3:ListBucket`, and `s3:GetBucketLocation` permissions
- Check that the policy applies to all resources (`"Resource": "*"` for listing buckets)
- Try using the AWS CLI locally with the same credentials to test: `aws s3 ls`

### Workflow Completes But CSV Is Not Updated

**Problem:** The workflow runs successfully but doesn't commit changes.

**Solutions:**
- Check if there are actually buckets in your AWS account
- Verify that the workflow has write permissions (should be configured in the workflow file)
- Look at the workflow logs for the "Commit and push changes" step
- The workflow may have detected no changes (e.g., bucket sizes identical to previous run)

### How to Verify AWS Credentials

Test your AWS credentials locally before using them in GitHub:

```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"

# Test listing buckets
aws s3 ls

# Or use the AWS SDK
node scripts/update-s3-data.js
```

### How to Check Workflow Logs

1. Go to the **Actions** tab in your repository
2. Click on the **S3 Bucket Size Monitor** workflow
3. Select the most recent run
4. Click on the **monitor-s3** job
5. Expand each step to see detailed logs
6. Look for error messages or stack traces

Common log messages:
- ✅ `Found X bucket(s)` - Successfully connected to AWS
- ✅ `Calculating size for bucket: bucket-name` - Processing buckets
- ✅ `Wrote X record(s) to ...` - Successfully updated CSV
- ❌ `AWS credentials not found` - Missing secrets
- ❌ `Access Denied` - IAM permissions issue

### Large Buckets Take Too Long

**Problem:** Workflow times out or takes very long for buckets with millions of objects.

**Note:** The current implementation lists all objects to calculate size. For very large buckets (millions of objects), consider these alternatives:
- Use AWS CloudWatch metrics (more efficient but may have slight delay)
- Implement pagination limits in the script
- Use S3 Inventory reports for bucket size data

### No Buckets Found

**Problem:** The workflow reports "No S3 buckets found".

**Solutions:**
- Verify you're using the correct AWS account credentials
- Check the `AWS_REGION` secret - ensure it's a valid region
- Some buckets might be in different regions - the script will still find them
- Log into AWS Console and verify buckets exist

## Architecture

```
┌─────────────────────────────────────────────┐
│         GitHub Actions Workflow             │
│                 (Scheduled)                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      scripts/update-s3-data.js              │
│                                              │
│  1. Connect to AWS with credentials         │
│  2. List all S3 buckets                     │
│  3. Calculate size for each bucket          │
│  4. Read existing CSV data                  │
│  5. Append new measurements                 │
│  6. Prune data > 30 days old                │
│  7. Write updated CSV                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         public/s3-data.csv                  │
│                                              │
│  Contains 30 days of historical data        │
│  Auto-committed back to repository          │
└─────────────────────────────────────────────┘
```

## License

This monitoring system is part of the S3 Bucket Dashboard project and follows the same license.

## Support

If you encounter issues not covered in the troubleshooting section:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review [AWS SDK for JavaScript v3 documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
3. Open an issue in this repository with:
   - Description of the problem
   - Relevant workflow logs
   - Steps you've already tried
