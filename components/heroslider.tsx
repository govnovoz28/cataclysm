'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

export default function HeroSlider({ posts }: { posts: Post[] }) {
  const[currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isPaused, setIsPaused] = useState(false);
  
  const[isDelayed, setIsDelayed] = useState(false);
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const[touchEnd, setTouchEnd] = useState<number | null>(null);

  const[fontSizeIndex, setFontSizeIndex] = useState(0);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const fontConfig = [
    { sizeClass: "text-[5.5rem]", leading: "leading-[0.8]",  descClamp: "line-clamp-none" },
    { sizeClass: "text-7xl",      leading: "leading-[0.85]", descClamp: "line-clamp-none" },
    { sizeClass: "text-6xl",      leading: "leading-[0.9]",  descClamp: "line-clamp-none" },
    { sizeClass: "text-5xl",      leading: "leading-[0.95]", descClamp: "line-clamp-none" },
    { sizeClass: "text-4xl",      leading: "leading-tight",  descClamp: "line-clamp-none" },
    { sizeClass: "text-2xl",      leading: "leading-snug",   descClamp: "line-clamp-5"    },
  ];

  const handleNext = useCallback(() => {
    setDirection('next'); 
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  const handlePrev = useCallback(() => {
    setDirection('prev'); 
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  },[posts.length]);

  const handleInteraction = useCallback(() => {
    setIsDelayed(true);
    if (delayRef.current) clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => {
      setIsDelayed(false);
    }, 8000); 
  },[]);

  useEffect(() => {
    if (isPaused || isDelayed) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  },[handleNext, isPaused, isDelayed]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
      handleInteraction();
    }
    if (isRightSwipe) {
      handlePrev();
      handleInteraction();
    }
  };

  useLayoutEffect(() => {
    setFontSizeIndex(0);
  }, [currentIndex]);

  useLayoutEffect(() => {
    const element = textContainerRef.current;
    if (!element) return;

    const checkFit = () => {
        if (element.clientHeight === 0) return;
        
        const isOverflowingY = element.scrollHeight > element.clientHeight;
        const isOverflowingX = element.scrollWidth > element.clientWidth;

        if ((isOverflowingY || isOverflowingX) && fontSizeIndex < fontConfig.length - 1) {
            setFontSizeIndex(prev => prev + 1);
        }
    };

    checkFit();

    const observer = new ResizeObserver(() => {
        checkFit();
    });
    
    observer.observe(element);

    return () => observer.disconnect();
  }, [fontSizeIndex, currentIndex]);

  if (!posts || posts.length === 0) return null;

  const getIndex = (offset: number) => {
    const len = posts.length;
    return (currentIndex + offset + len) % len;
  };

  const prevIndex = getIndex(-1);
  const nextIndex = getIndex(1);
  const activePost = posts[currentIndex];
  
  const catData = Array.isArray(activePost.categories) ? activePost.categories[0] : activePost.categories;

  const dateObj = new Date(activePost.created_at);
  const dateTech = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`;

  const titleText = activePost.title || '';
  const hasExcerpt = activePost.excerpt && activePost.excerpt.trim().length > 0;
  const displayTitle = titleText 
    ? titleText.charAt(0).toUpperCase() + titleText.slice(1) 
    : '';

  const currentFont = fontConfig[fontSizeIndex];

  const animationClass = direction === 'next' ? 'animate-slide-next' : 'animate-slide-prev';

  return (
    <div 
      className="relative w-full h-[540px] md:h-[480px] mt-20 mb-32 md:mt-40 md:mb-64 select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleInteraction} 
    >
      
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-[1500px] h-full flex items-center justify-center">

            {/* ← PREV (боковая карточка) */}
            <div className="absolute left-0 md:left-[2%] w-[20%] md:w-[25%] h-[280px] md:h-[380px] z-10 transition-all duration-700 ease-in-out pointer-events-none hidden md:block">
                {posts[prevIndex].image_url ? (
                <div className="relative w-full h-full">
                    <Image 
                        key={posts[prevIndex].id}
                        src={getImageUrl(posts[prevIndex].image_url)}
                        className={`object-cover grayscale brightness-[0.25] ${animationClass}`} 
                        alt="" 
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />
                </div>
                ) : (
                <div className="w-full h-full bg-neutral-900 border border-neutral-800/30"></div>
                )}
            </div>

            {/* → NEXT (боковая карточка) */}
            <div className="absolute right-0 md:right-[2%] w-[20%] md:w-[25%] h-[280px] md:h-[380px] z-10 transition-all duration-700 ease-in-out pointer-events-none hidden md:block">
                {posts[nextIndex].image_url ? (
                <div className="relative w-full h-full">
                    <Image 
                        key={posts[nextIndex].id}
                        src={getImageUrl(posts[nextIndex].image_url)}
                        className={`object-cover grayscale brightness-[0.25] ${animationClass}`} 
                        alt="" 
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />
                </div>
                ) : (
                <div className="w-full h-full bg-neutral-900 border border-neutral-800/30"></div>
                )}
            </div>

            {/* ЦЕНТРАЛЬНАЯ карточка */}
            <div className="relative z-20 w-full md:w-[70%] max-w-[1000px] h-full md:h-[450px] 
                            bg-theme-bg border border-neutral-900 shadow-2xl 
                            flex flex-col md:flex-row transition-transform duration-500">
                
                <button onClick={(e) => {e.stopPropagation(); handlePrev(); handleInteraction();}} className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 text-[#ffffff] transition-all duration-300 z-50 hover:scale-110 opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <button onClick={(e) => {e.stopPropagation(); handleNext(); handleInteraction();}} className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 text-[#ffffff] transition-all duration-300 z-50 hover:scale-110 opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Изображение активного поста */}
                <div className="relative w-full md:w-[45%] h-56 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-900">
                <Link href={`/post/${activePost.slug || activePost.id}`} className="block w-full h-full group relative">
                    {activePost.image_url ? (
                        <Image 
                            key={activePost.id}
                            src={getImageUrl(activePost.image_url)}
                            alt={activePost.title} 
                            className={`object-cover ${animationClass}`}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
                            <span className="font-mono text-[10px] text-neutral-700">NO_VISUAL_DATA</span>
                        </div>
                    )}
                </Link>
                </div>

                {/* Текстовая часть */}
                <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col h-full bg-theme-bg overflow-hidden">
                
                <div 
                    key={`meta-${activePost.id}`}
                    className={`flex flex-wrap justify-between items-start border-b border-neutral-900 pb-4 mb-4 shrink-0 gap-x-4 gap-y-2 ${animationClass}`}
                >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {catData ? (
                            <Link href={`/category/${catData.slug}`} className="text-sm font-mono font-bold text-white uppercase tracking-widest bg-neutral-900 px-3 py-1 hover:bg-neutral-800 transition-colors z-30">
                                {catData.title}
                            </Link>
                        ) : (
                            <span className="text-sm font-mono font-bold text-white uppercase tracking-widest bg-neutral-900 px-3 py-1">
                                {activePost.category || 'SYSTEM'}
                            </span>
                        )}
                        <span className="text-neutral-700 text-sm font-mono">/</span>
                        {activePost.author ? (
                            <>
                                {activePost.author.split(',').map((authorName, index, arr) => {
                                    const cleanName = authorName.trim();
                                    if (!cleanName) return null;
                                    const isLast = index === arr.length - 1;
                                    return (
                                        <div key={index} className="flex items-center whitespace-nowrap">
                                            <Link href={`/author/${cleanName}`} className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                                {cleanName}
                                            </Link>
                                            {!isLast && <span className="text-neutral-500 text-sm font-mono font-bold">,</span>}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <span className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-widest">UNKNOWN</span>
                        )}
                        {activePost.translator && (
                            <>
                                <span className="text-neutral-700 text-sm font-mono">/</span>
                                <span className="text-neutral-500 text-sm font-mono font-bold">ПЕРЕВОДЧИК:</span>
                                {activePost.translator.split(',').map((transName, index, arr) => {
                                    const cleanName = transName.trim();
                                    if (!cleanName) return null;
                                    const isLast = index === arr.length - 1;
                                    return (
                                        <div key={index} className="flex items-center whitespace-nowrap">
                                            <Link href={`/author/${cleanName}`} className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                                {cleanName}
                                            </Link>
                                            {!isLast && <span className="text-neutral-500 text-sm font-mono font-bold">,</span>}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                    <span className="text-sm font-mono text-neutral-500 tracking-widest whitespace-nowrap ml-auto pt-[2px]">
                        {dateTech}
                    </span>
                </div>

                <div 
                    key={`content-${activePost.id}`}
                    ref={textContainerRef}
                    className={`flex-grow flex flex-col justify-start min-h-0 relative overflow-hidden pb-2 ${animationClass}`}
                >
                    <Link href={`/post/${activePost.slug || activePost.id}`} className="block w-full">
                        <div className={`flex items-start break-normal w-full ${!hasExcerpt ? 'mb-0' : 'mb-3'}`}>
                            <h2 className={`
                                font-serif text-theme-title tracking-tight hover:text-white transition-colors w-full uppercase hyphens-none
                                ${currentFont.sizeClass} ${currentFont.leading}
                            `}>
                                {displayTitle}
                            </h2>
                        </div>
                    </Link>
                    
                    {hasExcerpt && (
                        <p className={`font-serif text-neutral-400 text-lg md:text-xl leading-relaxed ${currentFont.descClamp}`}>
                            {activePost.excerpt}
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-transparent shrink-0 flex justify-end items-center">
                    <Link href={`/post/${activePost.slug || activePost.id}`} className="group flex items-center gap-3 px-6 py-3 border border-neutral-800 hover:bg-neutral-900 transition-all">
                        <span className="text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-neutral-300 group-hover:text-white">
                            Читать
                        </span>
                    </Link>
                </div>
                </div>
            </div>
        </div>
      </div>

      {/* Точки-индикаторы */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
          {posts.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(idx > currentIndex ? 'next' : 'prev');
                setCurrentIndex(idx);
                handleInteraction();
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx 
                  ? 'bg-black dark:bg-white scale-125' 
                  : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
            />
          ))}
      </div>
    </div>
  );
}
