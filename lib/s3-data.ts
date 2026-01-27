export interface S3DataPoint {
  s3BucketName: string
  date: string
  spaceUsed: number
}

export interface BucketData {
  bucketName: string
  currentSize: number
  previousSize: number
  changePercent: number
  data: Array<{
    date: string
    size: number
  }>
}

export function parseCSV(csvText: string): S3DataPoint[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      s3BucketName: values[0],
      date: values[1],
      spaceUsed: parseFloat(values[2])
    }
  })
}

export function bytesToSize(bytes: number): { value: number; unit: string } {
  const gb = bytes / (1024 * 1024 * 1024)
  const tb = bytes / (1024 * 1024 * 1024 * 1024)
  
  if (tb >= 1) {
    return { value: parseFloat(tb.toFixed(2)), unit: 'TB' }
  } else if (gb >= 1) {
    return { value: parseFloat(gb.toFixed(2)), unit: 'GB' }
  } else {
    const mb = bytes / (1024 * 1024)
    return { value: parseFloat(mb.toFixed(2)), unit: 'MB' }
  }
}

export function processS3Data(data: S3DataPoint[]): BucketData[] {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // Filter last 30 days
  const recentData = data.filter(point => {
    const pointDate = new Date(point.date)
    return pointDate >= thirtyDaysAgo && pointDate <= now
  })
  
  // Group by bucket
  const bucketMap = new Map<string, S3DataPoint[]>()
  recentData.forEach(point => {
    if (!bucketMap.has(point.s3BucketName)) {
      bucketMap.set(point.s3BucketName, [])
    }
    bucketMap.get(point.s3BucketName)!.push(point)
  })
  
  // Process each bucket
  const buckets: BucketData[] = []
  bucketMap.forEach((points, bucketName) => {
    // Sort by date
    const sorted = points.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const currentSize = sorted[sorted.length - 1]?.spaceUsed || 0
    const previousSize = sorted[sorted.length - 2]?.spaceUsed || currentSize
    const changePercent = previousSize > 0 
      ? ((currentSize - previousSize) / previousSize) * 100 
      : 0
    
    buckets.push({
      bucketName,
      currentSize,
      previousSize,
      changePercent,
      data: sorted.map(p => ({
        date: p.date,
        size: p.spaceUsed
      }))
    })
  })
  
  return buckets.sort((a, b) => b.currentSize - a.currentSize)
}
