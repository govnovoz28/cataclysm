// components/table-of-contents.tsx
'use client'

import { useEffect, useState } from 'react'

type Heading = {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const[activeIndex, setActiveIndex] = useState<number>(-1)
  const[isCollapsed, setIsCollapsed] = useState(false)
  const[isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // Проверяем, находится ли пользователь в самом начале страницы
      // Увеличили порог до 800, чтобы таблица не затухала слишком рано
      setIsAtTop(window.scrollY < 800);

      let currentActiveIndex = -1;
      // Смещение, при котором заголовок считается "прочитанным" (40% высоты экрана)
      const offset = window.innerHeight * 0.4;

      headings.forEach((heading, index) => {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < offset) {
            currentActiveIndex = index;
          }
        }
      });

      setActiveIndex(currentActiveIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Проверка при монтировании

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length <= 1) return null

  return (
    <nav className={`sticky top-24 border bg-theme-bg/50 backdrop-blur-md rounded-sm hover:opacity-100 focus-within:opacity-100 transition-all duration-500 ${isAtTop ? 'opacity-100 border-neutral-800' : 'opacity-30 border-neutral-900'}`}>
      
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex items-center justify-between p-4 cursor-pointer select-none border-b transition-colors duration-500 ${isAtTop ? 'border-neutral-800' : 'border-neutral-900/50'}`}
      >
        <span className={`text-[10px] font-[system-ui,sans-serif] font-medium uppercase tracking-widest transition-colors duration-500 ${isAtTop ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Оглавление
        </span>
        <span className={`text-[10px] transform transition-all duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'} ${isAtTop ? 'text-neutral-400' : 'text-neutral-500'}`}>
          ▼
        </span>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
        <div className="overflow-hidden">
          <div className={`transition-opacity duration-500 ${isCollapsed ? 'opacity-0' : 'opacity-100'} max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar p-4`}>
            <ul className="space-y-3">
              {headings.map((heading, index) => {
                const isRead = index <= activeIndex;
                const isActive = index === activeIndex;

                return (
                  <li 
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
                  >
                    <a
                      href={`#${heading.id}`}
                      className={`text-[11px] font-[system-ui,sans-serif] font-medium uppercase tracking-widest transition-colors block line-clamp-3 leading-relaxed ${
                        isActive 
                          ? (isAtTop ? 'text-neutral-300 font-bold' : 'text-neutral-400 font-bold')
                          : isRead 
                            ? 'text-neutral-500' 
                            : isAtTop 
                              ? 'text-neutral-500 hover:text-neutral-300' 
                              : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        const element = document.getElementById(heading.id)
                        if (element) {
                          const y = element.getBoundingClientRect().top + window.scrollY - 100
                          window.scrollTo({ top: y, behavior: 'smooth' })
                        }
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      
    </nav>
  )
}