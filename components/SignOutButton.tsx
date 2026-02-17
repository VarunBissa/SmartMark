'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()
    
    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button 
            onClick={handleSignOut} 
            className="text-sm px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors border border-red-500/20 font-medium whitespace-nowrap"
        >
            Sign Out
        </button>
    )
}
