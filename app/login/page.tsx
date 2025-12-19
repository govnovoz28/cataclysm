'use client'

import { useState } from 'react'
// ВАЖНО: Импортируем createBrowserClient для работы с куками
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ВАЖНО: Создаем клиент здесь. Он автоматически запишет куки при входе.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('ACCESS_DENIED: INVALID_CREDENTIALS')
      setLoading(false)
    } else {
      // Обновляем роутер, чтобы Middleware увидел новые куки
      router.refresh()
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden font-mono selection:bg-white selection:text-black">
      
      {/* ФОН */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Кнопка "Назад" */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="text-[14px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
          <span>[</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          <span>ABORT SEQUENCE ]</span>
        </Link>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        
        <div className="text-center mb-4 select-none cursor-default">
          <h1 className={`${orbitron.className} text-4xl font-bold text-white tracking-widest uppercase mb-2`}>
            WELCOME!
          </h1>
          <p className="text-[11px] text-neutral-600 uppercase tracking-[0.3em]">
            Restricted Area / Auth Required
          </p>
        </div>

        <div className="relative border border-neutral-900 bg-[#0a0a0a]/90 backdrop-blur-sm p-10 shadow-2xl">
            {/* Уголки */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-neutral-500"></div>
            <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-neutral-500"></div>
            <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-neutral-500"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-neutral-500"></div>
            
            <form onSubmit={handleLogin} className="space-y-10">
            
            {/* EMAIL */}
            <div className="group relative">
              <label className="absolute -top-3 left-0 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-[#0a0a0a] pr-2 group-focus-within:text-white transition-colors">
                // Identity
              </label>
              <input
                id="email"
                type="email"
                placeholder="USER_ID..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-800 py-3 text-sm text-white placeholder:text-neutral-800 focus:outline-none focus:border-white transition-colors font-mono tracking-wider uppercase"
                required
                autoComplete="off"
              />
            </div>

            {/* PASSWORD */}
            <div className="group relative">
              <label className="absolute -top-3 left-0 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-[#0a0a0a] pr-2 group-focus-within:text-white transition-colors">
                // Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-800 py-3 pr-12 text-sm text-white placeholder:text-neutral-800 focus:outline-none focus:border-white transition-colors font-mono tracking-wider"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors focus:outline-none p-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="border border-red-900/40 bg-red-950/10 p-3 text-center animate-pulse">
                <p className="text-[10px] text-red-500 tracking-widest uppercase font-bold">
                  ! {errorMsg}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border
                ${loading 
                  ? 'bg-neutral-900 border-neutral-900 text-neutral-700 cursor-wait' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-600'
                }
              `}
            >
              {loading ? 'Decrypting...' : 'Initialize Session'}
            </button>
          </form>
        </div>

        <div className="mt-16 flex justify-between items-center text-[9px] text-neutral-800 font-mono uppercase tracking-widest select-none">
            <span>SECURE CONNECTION</span>
            <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-neutral-600 rounded-full animate-pulse"></span>
                STANDBY
            </span>
        </div>
      </div>
    </div>
  )
}