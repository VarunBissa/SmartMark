'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Login error:', error)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
        // We don't set loading to false here because we're redirecting
        // and we want to keep the loading state until the page unloads
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Rich Backdrop Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a]" />
      
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-slate-900/40 rounded-full blur-[130px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] p-8 mx-4">
        {/* Card Background Layer */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-[32px] border border-white/20 shadow-2xl ring-1 ring-white/5" />
        
        <div className="relative flex flex-col items-center py-6">
          {/* Logo */}
          <div className="mb-6 relative">
             {/* Optional glow behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/30 blur-3xl rounded-full" />
            <Image
              src="/logo.png" 
              alt="SmartMark Logo"
              width={200}
              height={200}
              className="relative drop-shadow-xl object-contain"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-[28px] font-bold tracking-tight text-white drop-shadow-sm">
              Welcome to SmartMark
            </h1>
            <p className="text-[15px] text-gray-400 font-medium max-w-[260px] mx-auto leading-relaxed">
              Sign in to sync your bookmarks across all devices
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-900 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-[17px]">Continue with Google</span>
              </>
            )}
          </button>
          
          {/* Footer/Terms */}
          <div className="mt-8 text-[11px] text-gray-500/80 text-center max-w-[200px] leading-tight font-medium">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-300 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-300 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}
