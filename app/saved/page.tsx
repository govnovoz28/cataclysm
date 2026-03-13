// ==========================================
// app\saved\page.tsx
// ==========================================
'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { get, set } from 'idb-keyval';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight:['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export default function SavedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('saved_posts').then((data) => {
      if (data) {
        setPosts(data.sort((a: any, b: any) => b.saved_at - a.saved_at));
      }
      setLoading(false);
    });
  },[]);

  const handleRemove = async (id: number) => {
    if (!window.confirm('Вы действительно хотите далить материал?')) return;
    const updatedPosts = posts.filter(p => p.id !== id);
    await set('saved_posts', updatedPosts);
    setPosts(updatedPosts);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col">
      <header className="border-b border-neutral-900 mb-8 relative bg-theme-bg overflow-hidden">
         
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
            <div className="relative w-[500px] h-[500px] bg-watermark">
                <Image 
                    src="/logo.png" 
                    alt="" 
                    fill
                    priority
                    className="object-contain"
                />
            </div>
        </div>

        <div className="max-w-[1200px] mx-auto relative py-6 px-4 z-10 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-end gap-y-4 md:gap-y-0">
            
            <div className="flex justify-start w-full md:w-auto order-2 md:order-1 md:mb-[6px] z-20">
                <Link 
                  href="/" 
                  className="text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white transition-colors border border-transparent hover:border-neutral-800 px-4 py-2.5"
                >
                ← Return to Index
                </Link>
            </div>

            <div className="flex flex-col items-center justify-end w-full md:w-auto order-1 md:order-2 h-12 md:h-[82px] mb-[2px]">
                <h1 className={`${orbitron.className} text-3xl md:text-5xl font-bold tracking-normal mb-[2px] text-white uppercase leading-none text-center`}>
                Оффлайн
                </h1>
                <p className="font-mono text-[12px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default text-center">
                Offline Access 
                </p>
            </div>

            <div className="hidden md:block order-3"></div>
        </div>
      </header>

      <section className="flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full pt-0 md:pt-4">
        {loading ? (
          <div className="text-center py-20">
            <p className="font-mono text-neutral-600 uppercase tracking-widest text-xs animate-pulse">
                // Loading Local Data...
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {posts.map((post) => {
              const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
              
              const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
              const categoryName = post.category || 'POST';
              const titleLength = post.title.length;
              const imageSrc = post.offline_image || post.image_url;
              
              let titleClass = "text-3xl leading-[0.9] tracking-tight"; 
              if (titleLength > 80) {
                titleClass = "text-xl leading-snug tracking-wide";
              } else if (titleLength > 40) {
                titleClass = "text-2xl leading-none";
              }

              return (
                <article 
                  key={post.id} 
                  className="group flex flex-col bg-theme-card border border-neutral-900 hover:border-neutral-700 transition-colors duration-300 relative"
                >
                  <Link 
                    href={`/saved/${post.slug || post.id}`} 
                    className="block relative w-full h-64 overflow-hidden border-b border-neutral-900 flex-shrink-0"
                  >
                    {imageSrc ? (
                      <Image 
                        src={imageSrc} 
                        alt={post.title}
                        fill
                        className="object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
                         <span className="font-mono text-[9px] text-neutral-800">NO_IMG_DATA</span>
                      </div>
                    )}
                  </Link>

                  {post.author && (
                      <div className="absolute top-0 left-0 z-20 flex flex-col items-start pointer-events-none">
                          {post.author.split(',').map((authorName: string, index: number) => {
                              const cleanName = authorName.trim();
                              if (!cleanName) return null;
                              return (
                                  <Link 
                                      key={index}
                                      href={`/author/${cleanName}`}
                                      className="pointer-events-auto block bg-black border-r border-b border-neutral-800 px-3 py-1 group/author cursor-pointer hover:bg-white transition-colors w-fit"
                                  >
                                    <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover/author:text-black">
                                      {cleanName}
                                    </span>
                                  </Link>
                              );
                          })}
                      </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-xs font-mono uppercase tracking-widest gap-2 mb-3 w-full text-neutral-500 flex-wrap">
                      <span>{date}</span>
                      <span className="text-neutral-700">/</span>
                      <span className="text-neutral-400 font-semibold">{categoryName}</span>

                      {post.translator && (
                        <>
                          <span className="text-neutral-700">/</span>
                          <span className="text-neutral-500">ПЕРЕВОДЧИК:</span>
                          <span className="text-neutral-400 font-semibold z-30 relative">
                              {post.translator}
                          </span>
                        </>
                      )}
                    </div>

                    <Link href={`/saved/${post.slug || post.id}`} className="block w-full mb-4">
                      <h2 className={`font-serif font-bold uppercase text-theme-text group-hover:text-white transition-colors line-clamp-3 ${titleClass}`}>
                        {post.title}
                      </h2>
                    </Link>

                    {hasExcerpt && (
                      <p className="font-serif text-neutral-300 text-lg leading-7 line-clamp-4 mb-8 flex-grow opacity-95">
                          {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-transparent group-hover:border-neutral-900 flex justify-between items-center">
                      <Link href={`/saved/${post.slug || post.id}`} className="inline-block text-[11px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                        Read Offline &rarr;
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(post.id);
                        }}
                        className="inline-block px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500 border border-neutral-800 hover:bg-red-900 hover:text-white hover:border-red-900 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-neutral-900 mt-10">
              <p className="font-mono text-neutral-600 uppercase tracking-widest text-xs">
                  // No saved materials found
              </p>
              <p className="text-[14px] text-neutral-700 mt-2 font-mono">
                  Сохраняйте статьи для чтения без подключения к сети
              </p>
          </div>
        )}
      </section>
    </div>
  );
}