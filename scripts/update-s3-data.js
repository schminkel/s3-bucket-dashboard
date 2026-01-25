#!/usr/bin/env node

/**
 * S3 Bucket Size Monitor Script
 * 
 * This script:
 * 1. Fetches all S3 buckets from AWS
 * 2. Calculates the total size of each bucket
 * 3. Calculates the total size of all buckets combined
 * 4. Appends the data to public/s3-data.csv
 * 5. Prunes data older than 30 days
 */

import 'dotenv/config';
import { 
  S3Client, 
  ListBucketsCommand, 
  ListObjectsV2Command,
  GetBucketLocationCommand 
} from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE = join(__dirname, '..', 'public', 's3-data.csv');
const CSV_HEADER = 's3BucketName,date,spaceUsed';
const DATA_RETENTION_DAYS = 30;

/**
 * Get the current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get the region of a bucket
 */
async function getBucketRegion(s3Client, bucketName) {
  try {
    const command = new GetBucketLocationCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);
    // LocationConstraint is null for us-east-1, otherwise it's the region name
    return response.LocationConstraint || 'us-east-1';
  } catch (error) {
    console.error(`  Error getting region for ${bucketName}:`, error.message);
    return null;
  }
}

/**
 * Calculate the total size of a bucket
 */
async function calculateBucketSize(globalS3Client, bucketName, credentials) {
  console.log(`Calculating size for bucket: ${bucketName}`);
  
  let totalSize = 0;
  let continuationToken = undefined;
  
  try {
    // Get the bucket's region
    const bucketRegion = await getBucketRegion(globalS3Client, bucketName);
    if (!bucketRegion) {
      console.error(`  Skipping ${bucketName}: Could not determine region`);
      return 0;
    }
    
    console.log(`  Region: ${bucketRegion}`);
    
    // Create a region-specific S3 client
    const regionalS3Client = new S3Client({
      region: bucketRegion,
      credentials: credentials,
    });
    
    // List all objects in the bucket
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      
      const response = await regionalS3Client.send(command);
      
      if (response.Contents) {
        for (const object of response.Contents) {
          totalSize += object.Size || 0;
        }
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    console.log(`  Size: ${totalSize} bytes`);
    return totalSize;
  } catch (error) {
    console.error(`  Error calculating size for ${bucketName}:`, error.message);
    return 0;
  }
}

/**
 * Get all S3 buckets and their sizes
 */
async function getBucketSizes() {
  // Validate AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }
  
  const region = process.env.AWS_REGION || 'us-east-1';
  console.log(`Using AWS region for ListBuckets: ${region}`);
  
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  
  const s3Client = new S3Client({
    region: region,
    credentials: credentials,
  });
  
  // List all buckets
  console.log('Fetching list of S3 buckets...');
  const listBucketsCommand = new ListBucketsCommand({});
  const { Buckets } = await s3Client.send(listBucketsCommand);
  
  if (!Buckets || Buckets.length === 0) {
    console.log('No S3 buckets found in this AWS account.');
    return [];
  }
  
  console.log(`Found ${Buckets.length} bucket(s)\n`);
  
  // Calculate size for each bucket
  const bucketSizes = [];
  let totalSize = 0;
  
  for (const bucket of Buckets) {
    const bucketName = bucket.Name;
    const size = await calculateBucketSize(s3Client, bucketName, credentials);
    
    bucketSizes.push({
      name: bucketName,
      size: size,
    });
    
    totalSize += size;
  }
  
  // Add the "all" entry for total size
  bucketSizes.push({
    name: 'all',
    size: totalSize,
  });
  
  console.log(`\nTotal size of all buckets: ${totalSize} bytes`);
  
  return bucketSizes;
}

/**
 * Read existing CSV data
 */
function readCsvData() {
  if (!existsSync(CSV_FILE)) {
    console.log('CSV file does not exist. Will create a new one.');
    return [];
  }
  
  const content = readFileSync(CSV_FILE, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length <= 1) {
    // Only header or empty file
    return [];
  }
  
  // Skip header and parse data
  return lines.slice(1).map(line => {
    const [s3BucketName, date, spaceUsed] = line.split(',');
    return { s3BucketName, date, spaceUsed };
  });
}

/**
 * Prune data older than 30 days
 */
function pruneOldData(data, currentDate) {
  const cutoffDate = new Date(currentDate);
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  
  console.log(`\nPruning data older than ${cutoffDateStr}`);
  const originalCount = data.length;
  const prunedData = data.filter(row => row.date >= cutoffDateStr);
  const removedCount = originalCount - prunedData.length;
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} old record(s)`);
  } else {
    console.log('No old records to remove');
  }
  
  return prunedData;
}

/**
 * Write data to CSV file
 */
function writeCsvData(data) {
  const lines = [CSV_HEADER];
  
  for (const row of data) {
    lines.push(`${row.s3BucketName},${row.date},${row.spaceUsed}`);
  }
  
  const content = lines.join('\n') + '\n';
  writeFileSync(CSV_FILE, content, 'utf-8');
  console.log(`\nWrote ${data.length} record(s) to ${CSV_FILE}`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== S3 Bucket Size Monitor ===\n');
    
    const currentDate = getCurrentDate();
    console.log(`Current date: ${currentDate}\n`);
    
    // Get bucket sizes from AWS
    const bucketSizes = await getBucketSizes();
    
    if (bucketSizes.length === 0) {
      console.log('\nNo buckets to process. Exiting.');
      process.exit(0);
    }
    
    // Read existing CSV data
    console.log('\nReading existing CSV data...');
    let csvData = readCsvData();
    
    // Add new data
    console.log(`\nAdding ${bucketSizes.length} new record(s) for ${currentDate}`);
    for (const bucket of bucketSizes) {
      csvData.push({
        s3BucketName: bucket.name,
        date: currentDate,
        spaceUsed: bucket.size.toString(),
      });
    }
    
    // Prune old data
    csvData = pruneOldData(csvData, currentDate);
    
    // Write updated data
    writeCsvData(csvData);
    
    console.log('\n=== Success! ===');
    process.exit(0);
  } catch (error) {
    console.error('\n=== Error ===');
    console.error('An error occurred:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

main();
