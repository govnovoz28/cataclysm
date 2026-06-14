'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    // Мгновенная проверка локальных куки вместо зависающего запроса к Supabase
    if (document.cookie.includes('-auth-token')) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <Link 
      href="/admin" 
      className={`block font-[system-ui,sans-serif] font-light text-base uppercase tracking-[0.15em] transition-colors text-left whitespace-nowrap ${isLoggedIn ? 'text-green-500 hover:text-green-400' : 'text-white hover:text-neutral-500'}`}
    >
      {isLoggedIn ? 'Панель управления' : 'Вход'}
    </Link>
  )
}