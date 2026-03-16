// ==========================================
// components\scroll-to-top.tsx
// ==========================================
'use client'

import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        hidden md:block xl:hidden 2xl:block
        fixed top-20 left-4 2xl:left-16 z-50 
        p-2
        text-neutral-600 hover:text-white
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
      aria-label="Наверх"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="36" 
        height="36" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      >
        <path d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}