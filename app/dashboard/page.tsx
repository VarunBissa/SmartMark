'use client'

import React, { useEffect, useState, Suspense, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Types
interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
}

function DashboardContent() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Confirmation Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // We should memoize supabase client or treat it as stable.
  // Ideally, createClient() returns a stable instance if using the singleton pattern in lib, 
  // but if it creates a new instance every render, useMemo helps.
  // Currently '@/lib/supabase/client' exports a function that creates a new browser client.
  // The browser client from @supabase/ssr is generally lightweight and stable in configuration
  // but let's assume valid stability or just remove it from dependencies if we accept it won't change config.
  const [supabase] = useState(() => createClient())

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
          console.error('Error fetching:', error)
      } else {
          setBookmarks(data as Bookmark[])
      }
    } catch (e) {
      console.error('Unexpected error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchBookmarks()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime bookmarks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
        } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
            setBookmarks((prev) => prev.map((bookmark) => bookmark.id === payload.new.id ? payload.new as Bookmark : bookmark))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchBookmarks])

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Simple Title Logic
      let finalTitle = title
      if (!finalTitle) {
           try {
               finalTitle = new URL(url).hostname
           } catch {
               finalTitle = 'New Bookmark'
           }
      }

      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        url,
        title: finalTitle
      })

      if (error) throw error

      setUrl('')
      setTitle('')

    } catch (error) {
      console.error('Error adding bookmark:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const confirmDelete = async () => {
      if (!deletingId) return
      
      const { error } = await supabase.from('bookmarks').delete().eq('id', deletingId)
      if (error) console.error('Error deleting:', error)
      
      setDeletingId(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
      
      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#11111f] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-white mb-2">Delete Bookmark?</h3>
                <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this bookmark? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeletingId(null)}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* LEFT COLUMN: Add New Form */}
      <div className="lg:col-span-4 space-y-8">
        <div>
            <h1 className="text-xl font-bold text-white mb-1">Add New</h1>
            <p className="text-sm text-gray-500">Save a URL to your collection</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#11111f] border border-white/20 rounded-xl p-6 shadow-xl">
            <form onSubmit={handleAddBookmark} className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        placeholder="Bookmark Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>
                <div>
                    <input 
                        type="url" 
                        required
                        placeholder="URL (https://...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isAdding}
                    className="w-full bg-[#1d5eff] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
                >
                    {isAdding ? 'Adding...' : 'Add Bookmark'}
                </button>
            </form>
        </div>


      </div>

      {/* RIGHT COLUMN: Collection */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Collection</h2>
                <p className="text-sm text-gray-500">Manage and access your saved links</p>
            </div>
            
            {/* Item Count Pill */}
            <div className="px-3 py-1 bg-[#11111f] border border-white/10 rounded-full">
                <span className="text-xs font-medium text-gray-400">{bookmarks.length} items</span>
            </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px]">
            {bookmarks.length === 0 && !isLoading ? (
                // Empty State
                <div className="h-[200px] w-full border border-dashed border-white/20 bg-[#0a0a12]/50 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <p className="text-gray-400 font-medium mb-1">No bookmarks yet.</p>
                    <p className="text-sm text-gray-600">Add your first bookmark using the form above.</p>
                </div>
            ) : (
                // Cards Grid
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {bookmarks.map(bookmark => (
                     <div 
                        key={bookmark.id}
                        className="group relative bg-[#11111f] hover:bg-[#161626] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col justify-between h-[180px]"
                     >
                        <div>
                             <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[#0a0a12] border border-white/5 flex items-center justify-center text-lg font-bold text-gray-500 shrink-0 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                                    {bookmark.title.charAt(0).toUpperCase()}
                                </div>
                                <button 
                                    onClick={() => setDeletingId(bookmark.id)}
                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                             </div>
                             
                             <h3 className="font-semibold text-white truncate mb-1 group-hover:text-blue-400 transition-colors" title={bookmark.title}>
                                {bookmark.title}
                             </h3>
                             <p className="text-xs text-gray-500 truncate font-mono">
                                 {new URL(bookmark.url).hostname.replace('www.', '')}
                             </p>
                        </div>

                        <div className="pt-4 mt-auto border-t border-white/5">
                             <a 
                                href={bookmark.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-2 group/link"
                             >
                                 Visit Website
                                 <svg className="group-hover/link:translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                             </a>
                        </div>
                     </div>
                 ))}
                </div>
            )}
            
            {/* Loading */}
            {isLoading && (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {[1,2,3].map(i => (
                         <div key={i} className="h-[180px] bg-[#11111f] rounded-xl animate-pulse" />
                     ))}
                 </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={null}>
            <DashboardContent />
        </Suspense>
    )
}
