// ==========================================
// components\publication-modal.tsx
// ==========================================
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function PublicationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  },[])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block font-[system-ui,sans-serif] font-light text-base text-white hover:text-neutral-500 uppercase tracking-[0.15em] transition-colors text-left whitespace-nowrap"
      >
        Условия публикации
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative z-10 w-full max-w-2xl bg-theme-bg border border-neutral-800 p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl md:text-2xl font-serif text-white mb-8 uppercase tracking-wide text-center border-b border-neutral-900 pb-4">
              Условия публикации
            </h2>

            <div className="font-serif text-neutral-300 space-y-6 leading-relaxed text-lg">
              <p>
                Ваша работа будет рассматриваться редакторами журнала Cataclysm в чате телеграм канала:{' '}
                <a 
                  href="https://t.me/ksenoimpulsi2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white underline decoration-neutral-600 underline-offset-4 hover:decoration-white transition-all"
                >
                  https://t.me/ksenoimpulsi2
                </a>
              </p>

              <p>
                <span className="text-white font-medium">Требуется:</span> наличие заголовков, философско-литературная тематика или же академический философский текст, наличие общей темы в работе или проблематики. <span className="text-white font-medium">Минимальное количество слов: 2500.</span>
              </p>

              <p className="text-neutral-400 italic border-l-2 border-neutral-700 pl-4">
                Авторам необходимо поддерживать аффилиацию.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}