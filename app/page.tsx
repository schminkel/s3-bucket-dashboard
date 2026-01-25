import { promises as fs } from 'fs'
import path from 'path'
import { BucketCard } from '@/components/bucket-card'
import { parseCSV, processS3Data, bytesToSize } from '@/lib/s3-data'
import { PasswordDialog } from '@/components/password-dialog'
import { Database, HardDrive } from 'lucide-react'

export default async function DashboardPage() {
  // Read CSV file at build time
  const filePath = path.join(process.cwd(), 'public', 's3-data.csv')
  const fileContents = await fs.readFile(filePath, 'utf8')
  
  // Process data
  const rawData = parseCSV(fileContents)
  const buckets = processS3Data(rawData)
  
  // Calculate total storage
  const totalStorage = buckets.reduce((sum, bucket) => sum + bucket.currentSize, 0)
  const totalFormatted = bytesToSize(totalStorage)
  
  return (
    <PasswordDialog>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2">
                  <Database className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Storage Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor S3 bucket usage</p>
                </div>
              </div>
            
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Storage</div>
                <div className="text-2xl font-semibold text-foreground">
                  {totalFormatted.value}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {totalFormatted.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
      
        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>{buckets.length} buckets • Last 30 days</span>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {buckets.map((bucket) => (
              <BucketCard key={bucket.bucketName} bucket={bucket} />
            ))}
          </div>
        
          {buckets.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No data available</h3>
              <p className="text-sm text-muted-foreground">
                Add your S3 bucket data to the CSV file to see the dashboard.
              </p>
            </div>
          )}
        </main>
      
        {/* Footer */}
        <footer className="border-t border-border bg-card mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-xs text-muted-foreground text-center">
              Data updated from{' '}
              <a 
                href="/s3-data.csv" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
              >
                s3-data.csv
              </a>
              {' '}• Showing last 30 days
            </p>
          </div>
      </footer>
    </div>
    </PasswordDialog>
  )
}
