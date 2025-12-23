'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  author: string | null;
  category: string | null;
  created_at: string;
  
  categories?: { title: string; slug: string } | { title: string; slug: string }[] | null;
};

export default function HeroSlider({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  }, [posts.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext, isPaused]);

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
  const titleLen = titleText.length;

  let titleClass = "";
  let titleClamp = "";
  let descClamp = "line-clamp-3"; 

  if (titleLen > 100) {
      titleClass = "text-xl md:text-2xl uppercase leading-snug"; 
      titleClamp = "line-clamp-6"; 
      descClamp = "line-clamp-2";  
  } else if (titleLen > 60) {
      titleClass = "text-2xl md:text-3xl lg:text-4xl uppercase leading-tight";
      titleClamp = "line-clamp-5"; 
      descClamp = "line-clamp-3";
  } else if (titleLen > 35) {
      titleClass = "text-3xl md:text-4xl lg:text-5xl uppercase leading-[0.95]";
      titleClamp = "line-clamp-4"; 
      descClamp = "line-clamp-4";
  } else {
      titleClass = "text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.9]";
      titleClamp = "line-clamp-3"; 
      descClamp = "line-clamp-4";
  }

  const hasExcerpt = activePost.excerpt && activePost.excerpt.trim().length > 0;

  const displayTitle = titleText 
    ? titleText.charAt(0).toUpperCase() + titleText.slice(1) 
    : '';

  return (
    <div 
      className="relative w-full h-[540px] md:h-[480px] my-20 md:my-36 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Background Layer */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-[1500px] h-full flex items-center justify-center">

            {/* Left Prev Image */}
            <div className="absolute left-0 md:left-[2%] w-[20%] md:w-[25%] h-[280px] md:h-[380px] z-10 transition-all duration-700 ease-in-out pointer-events-none hidden md:block">
                {posts[prevIndex].image_url ? (
                <img src={posts[prevIndex].image_url!} className="w-full h-full object-cover grayscale brightness-[0.25]" alt="" />
                ) : (
                <div className="w-full h-full bg-neutral-900 border border-neutral-800/30"></div>
                )}
            </div>

            {/* Right Next Image */}
            <div className="absolute right-0 md:right-[2%] w-[20%] md:w-[25%] h-[280px] md:h-[380px] z-10 transition-all duration-700 ease-in-out pointer-events-none hidden md:block">
                {posts[nextIndex].image_url ? (
                <img src={posts[nextIndex].image_url!} className="w-full h-full object-cover grayscale brightness-[0.25]" alt="" />
                ) : (
                <div className="w-full h-full bg-neutral-900 border border-neutral-800/30"></div>
                )}
            </div>

            {/* Main Center Card */}
            <div className="relative z-20 w-full md:w-[70%] max-w-[1000px] h-full md:h-[450px] 
                            bg-[#0a0a0a] border border-neutral-900 shadow-2xl 
                            flex flex-col md:flex-row transition-transform duration-500">
                
                {/* Navigation Buttons */}
                <button onClick={(e) => {e.stopPropagation(); handlePrev()}} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 text-white transition-all duration-300 z-30 hover:scale-110 opacity-70 hover:opacity-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <button onClick={(e) => {e.stopPropagation(); handleNext()}} className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 text-white transition-all duration-300 z-30 hover:scale-110 opacity-70 hover:opacity-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Left Side: Image */}
                <div className="relative w-full md:w-[45%] h-56 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-900">
                <Link href={`/post/${activePost.id}`} className="block w-full h-full group">
                    {activePost.image_url ? (
                        <img src={activePost.image_url} alt={activePost.title} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
                            <span className="font-mono text-[10px] text-neutral-700">NO_VISUAL_DATA</span>
                        </div>
                    )}
                </Link>
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col h-full bg-[#0a0a0a]">
                
                {/* Meta Header */}
                <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Category */}
                        {catData ? (
                            <Link 
                                href={`/category/${catData.slug}`}
                                className="text-sm font-mono font-bold text-white uppercase tracking-widest bg-neutral-900 px-3 py-1 hover:bg-neutral-800 transition-colors z-30"
                            >
                                {catData.title}
                            </Link>
                        ) : (
                            <span className="text-sm font-mono font-bold text-white uppercase tracking-widest bg-neutral-900 px-3 py-1">
                                {activePost.category || 'SYSTEM'}
                            </span>
                        )}
                        {/* Divider */}
                        <span className="text-neutral-700 text-sm font-mono">/</span>
                        
                        {/* Authors - UPDATED LOGIC HERE */}
                        {activePost.author ? (
                            <div className="flex flex-wrap items-center z-30">
                                {activePost.author.split(',').map((authorName, index, arr) => {
                                    const cleanName = authorName.trim();
                                    if (!cleanName) return null;
                                    
                                    const isLast = index === arr.length - 1;

                                    return (
                                        <div key={index} className={`flex items-center ${!isLast ? 'mr-3' : ''}`}>
                                            <Link 
                                                href={`/author/${cleanName}`} 
                                                className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors"
                                                onClick={(e) => e.stopPropagation()} 
                                            >
                                                {cleanName}
                                            </Link>
                                            {!isLast && (
                                                <span className="text-neutral-500 text-sm font-mono font-bold">,</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-widest">UNKNOWN</span>
                        )}

                    </div>
                    <span className="text-sm font-mono text-neutral-500 tracking-widest">{dateTech}</span>
                </div>

                {/* Title & Excerpt */}
                <div className="flex-grow flex flex-col justify-start min-h-0 relative">
                    <Link href={`/post/${activePost.id}`} className="block w-full">
                        <div className={`flex items-start break-words w-full ${!hasExcerpt ? 'mb-0' : 'mb-3'}`}>
                            <h2 className={`
                                font-serif text-[#f0f0f0] tracking-tight hover:text-white transition-colors w-full
                                ${titleClass} ${titleClamp}
                            `}>
                                {displayTitle}
                            </h2>
                        </div>
                    </Link>
                    
                    {hasExcerpt && (
                        <p className={`font-serif text-neutral-400 text-base md:text-lg leading-relaxed ${descClamp}`}>
                            {activePost.excerpt}
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-transparent shrink-0 flex justify-end items-center">
                    <Link href={`/post/${activePost.id}`} className="group flex items-center gap-3 px-6 py-3 border border-neutral-800 hover:bg-neutral-900 transition-all">
                        <span className="text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-neutral-300 group-hover:text-white">
                            Читать
                        </span>
                    </Link>
                </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
