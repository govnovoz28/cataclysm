// ==========================================
// components\header.tsx
// ==========================================
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Orbitron } from 'next/font/google'

import NavPanel from '@/components/nav-panel'
import type { Category } from '@/types'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight:['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

type HeaderProps = {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const[isNavOpen, setIsNavOpen] = useState(false)

  return (
    <>
      <header 
        className="relative z-[101] bg-theme-bg border-b border-neutral-900"
      >
          <div className="max-w-[1470px] mx-auto relative py-6 px-4 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-end gap-y-4 md:gap-y-0">
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsNavOpen(!isNavOpen)}
                  className="text-neutral-300 hover:text-white transition-colors flex items-center justify-center p-1 -ml-1"
                  aria-label="Toggle menu"
                >
                  {isNavOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-end justify-center gap-4 select-none w-full md:w-auto md:order-2">
                  <div 
                    className="relative w-12 h-12 md:w-[74px] md:h-[74px] flex-shrink-0 z-10 mb-[2px]"
                    style={{ position: 'relative', width: '74px', height: '74px', maxWidth: '100%' }}
                  >
                          <Image 
                          src="/logo.png" 
                          alt="Cataclysm Logo"
                          fill
                          priority
                          className="object-contain opacity-100 header-logo"
                          sizes="(max-width: 768px) 48px, 74px"
                      />
                  </div>

                  <div className="flex flex-col items-center justify-end">
                      <h1 className={`${orbitron.className} text-5xl md:text-6xl font-bold tracking-normal lowercase cursor-default text-white drop-shadow-2xl leading-[0.85] mb-1 text-center`}>
                          cataclysm
                      </h1>
                      
                      <p className="sr-only">
                        Журнал cataclysm. Публикация текстов в рамках современной философии и за её пределами.
                      </p>

                      <p className="font-mono text-[11px] md:text-[14px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default text-center">
                          ACCD and Layer-culture research
                      </p>
                  </div>
              </div>

              <div className="hidden md:block order-3"></div>

          </div>
      </header>
      <NavPanel 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
        categories={categories} 
      />
    </>
  )
}