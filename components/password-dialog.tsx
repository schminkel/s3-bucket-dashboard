'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || 'admin123'

export function PasswordDialog({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if already authenticated in this session
    const authenticated = sessionStorage.getItem('authenticated')
    if (authenticated === 'true') {
      setIsAuthenticated(true)
    }
    setIsChecking(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === APP_PASSWORD) {
      sessionStorage.setItem('authenticated', 'true')
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  // Show loading state briefly to prevent flash
  if (isChecking) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">S3 Storage Dashboard</DialogTitle>
            <DialogDescription className="text-center">
              Please enter the password to access the dashboard
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                autoFocus
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <p className="text-sm text-destructive mt-2">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return <>{children}</>
}
