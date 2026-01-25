'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BucketData, bytesToSize } from '@/lib/s3-data'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDown, ArrowUp, Database } from 'lucide-react'

interface BucketCardProps {
  bucket: BucketData
}

export function BucketCard({ bucket }: BucketCardProps) {
  const currentSizeFormatted = bytesToSize(bucket.currentSize)
  const isIncreasing = bucket.changePercent > 0
  
  // Transform data for chart
  const chartData = bucket.data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.size / (1024 * 1024 * 1024) // Convert to GB for chart
  }))
  
  // Calculate domain with padding for better visibility
  const values = chartData.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1 || 0.1
  
  return (
    <Card className="bg-card border-border hover:border-muted-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-muted p-2">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-foreground leading-none">
                {bucket.bucketName}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5">S3 Bucket</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-semibold text-foreground leading-none">
              {currentSizeFormatted.value}
              <span className="text-base font-normal text-muted-foreground ml-1">
                {currentSizeFormatted.unit}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-1.5">
              {isIncreasing ? (
                <ArrowUp className="h-3 w-3 text-blue-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-emerald-500" />
              )}
              <span className={`text-xs font-medium ${
                isIncreasing ? 'text-blue-500' : 'text-emerald-500'
              }`}>
                {Math.abs(bucket.changePercent).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${bucket.bucketName}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                hide
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                hide
                domain={[minValue - padding, maxValue + padding]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number
                    return (
                      <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                        <div className="text-xs font-medium text-foreground">
                          {value.toFixed(2)} GB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payload[0].payload.date}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={`url(#gradient-${bucket.bucketName})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          <span>30 days ago</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  )
}
