'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      
      {/* Rich Backdrop Gradients (From Login Page) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
      
      {/* Ambient Background Orbs (From Login Page) */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-slate-900/40 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-white/5 bg-[#0a0a1a]/40 backdrop-blur-xl sticky top-0">
        <div className="w-full px-8 h-20 flex items-center justify-between">
            {/* Brand */}
            <Link href="/dashboard" className="flex items-center gap-4 group">
                <div className="relative">
                    <Image
                        src="/logo.png" 
                        alt="SmartMark Logo"
                        width={190}
                        height={190}
                        className="relative object-contain"
                        style={{ width: "auto", height: "auto" }}
                        priority
                    />
                </div>
            </Link>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-6">
                {user && (
                    <div className="flex items-center gap-3 text-right">
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-white leading-tight">
                                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-400">
                                {user.email}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 overflow-hidden relative">
                             {user.user_metadata?.avatar_url ? (
                                 <Image 
                                    src={user.user_metadata.avatar_url} 
                                    alt="Avatar" 
                                    fill 
                                    sizes="40px"
                                    className="object-cover"
                                 />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                             )}
                        </div>
                    </div>
                )}
                
                <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

                <button 
                    onClick={handleSignOut}
                    className="text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg transition-all"
                >
                    Sign Out
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full px-8 py-12">
        {children}
      </main>
    </div>
  )
}
