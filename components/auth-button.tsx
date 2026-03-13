// ==========================================
// components\auth-button.tsx
// ==========================================
'use client'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const[user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  },[])

  return (
    <Link 
      href="/admin" 
      className={`block font-[system-ui,sans-serif] font-light text-base uppercase tracking-[0.15em] transition-colors text-left whitespace-nowrap ${user ? 'text-green-500 hover:text-green-400' : 'text-white hover:text-neutral-500'}`}
    >
      {user ? 'Панель управления' : 'Вход'}
    </Link>
  )
}