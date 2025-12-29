'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const [isTimeout, setIsTimeout] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Set timeout for SSO callback
    const timeoutId = setTimeout(() => {
      console.warn('SSO callback timeout reached')
      setIsTimeout(true)
    }, 20000) // 20 second timeout for SSO

    return () => clearTimeout(timeoutId)
  }, [])

  if (isTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-lg font-medium">Sign-in timeout</div>
          <div className="text-sm text-muted-foreground">
            The sign-in process is taking longer than expected. This might be due to a network issue or the authentication provider being slow.
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setIsTimeout(false)
                window.location.reload()
              }}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  )
}
