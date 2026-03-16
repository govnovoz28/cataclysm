'use client'

import Link from 'next/link'
import AuthButton from '@/components/auth-button'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import type { Category } from '@/types'

type NavPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function NavPanel({ isOpen, onClose, categories }: NavPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const overlayRef = useRef<HTMLDivElement>(null)
  const touchStartYRef = useRef<number | null>(null)

  // Блокировка скролла + non-passive touchmove для предотвращения скролла страницы при свайпе
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.custom-scrollbar')) return
      touchStartYRef.current = e.targetTouches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.custom-scrollbar')) return
      // preventDefault здесь работает только благодаря { passive: false }
      e.preventDefault()
    }

    const onTouchEnd = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.custom-scrollbar')) return
      const startY = touchStartYRef.current
      if (!startY) return
      const endY = e.changedTouches[0].clientY
      const distance = startY - endY
      if (distance > 50) onClose()
      touchStartYRef.current = null
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd, { passive: true })
    }

    return () => {
      document.body.style.overflow = ''
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    setShowResults(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchResults = async () => {
      setIsSearching(true)
      const { data } = await supabase
        .from('posts')
        .select('id, slug, title, author')
        .or(`title.fts(russian).${searchQuery},author.ilike.%${searchQuery}%,content.fts(russian).${searchQuery}`)
        .limit(8)

      if (data) {
        setSearchResults(data)
        setSelectedIndex(-1)
      }
      setIsSearching(false)
    }

    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      setIsFocused(false)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        router.push(`/post/${searchResults[selectedIndex].slug || searchResults[selectedIndex].id}`)
        onClose()
      } else if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        onClose();
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />
      <nav
        className={`absolute top-0 left-0 right-0 bg-theme-bg border-b border-neutral-900 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
        onClick={() => setShowResults(false)}
      >
        <div className="max-w-[1470px] mx-auto px-4 pt-56 md:pt-40 pb-8 md:pb-12">
          
          {/* SEARCH BAR & AUTH BUTTON */}
          <div className="flex justify-between items-start mb-8 min-h-[48px]">
            <div
              className="w-full max-w-xl relative z-50 group"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center border border-neutral-800 group-focus-within:border-neutral-700 transition-colors bg-theme-bg"
              >
                
                {/* Left Icon (Magnifier or X) */}
                <div className="flex items-center justify-center">
                  {(isFocused || searchQuery) ? (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSearchQuery('')
                        setShowResults(false)
                        setSelectedIndex(-1)
                        inputRef.current?.blur()
                        setIsFocused(false)
                      }}
                      className="pl-4 pr-3 py-3 text-neutral-500 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.focus()}
                      className="pl-4 pr-3 py-3 text-neutral-500 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ПОИСК..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsFocused(true)
                    if (searchQuery.trim()) setShowResults(true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200)
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent py-2 text-xs md:text-sm font-mono uppercase tracking-widest text-white placeholder:text-neutral-600 focus:outline-none"
                />

                {/* Loading Spinner */}
                {isSearching && (
                  <div className="pr-3 flex items-center">
                    <div className="w-3 h-3 border-2 border-neutral-500 border-t-neutral-300 rounded-full animate-spin"></div>
                  </div>
                )}

                {/* SEARCH Button */}
                <button
                  type="submit"
                  className="border-l border-neutral-800 group-focus-within:border-neutral-700 px-4 py-3 text-xs font-mono uppercase tracking-widest text-neutral-300 hover:bg-white hover:text-black transition-colors shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Dropdown Results */}
              {showResults && searchQuery && (
                <div
                  className="absolute top-full left-0 right-0 flex flex-col max-h-[50vh] overflow-y-auto custom-scrollbar bg-theme-bg border border-neutral-800 group-focus-within:border-neutral-700 border-t-0 shadow-2xl z-50"
                  onMouseLeave={() => setSelectedIndex(-1)}
                >
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <span className="text-sm text-neutral-600 font-mono uppercase tracking-widest animate-pulse">Поиск...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map((post, idx) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.slug || post.id}`}
                          onClick={onClose}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`block p-4 transition-all ${
                            selectedIndex === idx
                              ? 'bg-neutral-900'
                              : 'bg-transparent hover:bg-neutral-900/50'
                          }`}
                        >
                          <h4 className={`text-base md:text-lg font-serif transition-colors line-clamp-2 uppercase ${
                              selectedIndex === idx ? 'text-white' : 'text-neutral-300'
                            }`}>
                              {post.title}
                          </h4>
                          {post.author && (
                            <span className={`text-[10px] md:text-xs font-mono uppercase tracking-widest mt-2 block transition-colors ${
                              selectedIndex === idx ? 'text-neutral-400' : 'text-neutral-600'
                            }`}>
                              {post.author}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <span className="text-sm text-neutral-600 font-mono uppercase tracking-widest">Ничего не найдено</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AUTH BUTTON (DESKTOP) */}
            <div className="hidden md:block mt-2" onClick={onClose}>
              <AuthButton />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-start gap-8 md:gap-16 lg:gap-20">
            
            {/* Первая колонка */}
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="block font-[system-ui,sans-serif] font-light text-base text-white hover:text-neutral-500 uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
                >
                  {cat.title}
                </Link>
              ))}
            </div>

            {/* Вторая колонка */}
            <div className="flex flex-col gap-3">
              <Link
                href="/publication"
                onClick={onClose}
                className="block font-[system-ui,sans-serif] font-light text-base text-white hover:text-neutral-500 uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
              >
                Условия публикации
              </Link>
              <Link
                href="https://boosty.to/catalysm"
                onClick={onClose}
                className="block font-[system-ui,sans-serif] font-light text-base text-white hover:text-neutral-500 uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
              >
                Поддержать проект
              </Link>
              <Link
                href="https://vk.com/club219573774"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="block font-[system-ui,sans-serif] font-light text-base text-white hover:text-neutral-500 uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
              >
                Группа ВКонтакте
              </Link>
            </div>

            {/* Третья колонка (MOBILE ONLY) */}
            <div className="flex flex-col gap-3 md:hidden">
              <div onClick={onClose}>
                <AuthButton />
              </div>
            </div>

          </div>
        </div>
      </nav>
    </div>
  )
}