// ==========================================
// app\saved\[slug]\page.tsx
// ==========================================
'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { get } from 'idb-keyval';
import ReadingProgress from '@/components/reading-progress';
import ScrollToTop from '@/components/scroll-to-top';
import { ThemeToggle } from '@/components/theme-toggle';
import TableOfContents from '@/components/table-of-contents';

function capitalizeFirstLetter(string: string | null | undefined) {
  if (!string) return '';
  const lower = string.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function SavedPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('saved_posts').then((posts: any[]) => {
      if (posts) {
        const found = posts.find(p => p.slug === slug || p.id.toString() === slug);
        setPost(found || null);
      }
      setLoading(false);
    });
  },[slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <span className="font-mono text-neutral-600 uppercase tracking-widest text-xs animate-pulse">
          Loading from Local Storage...
        </span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center flex-col gap-4">
        <span className="font-mono text-neutral-600 uppercase tracking-widest text-xs">
          Article not found in local storage
        </span>
        <Link href="/saved" className="text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white border border-neutral-800 px-4 py-2">
          Return to Saved
        </Link>
      </div>
    );
  }

  const formattedTitle = capitalizeFirstLetter(post.title);
  const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const cleanText = (post.content || '').replace(/<[^>]*>?/gm, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const isLongText = wordCount > 500; 

  const imageSrc = post.offline_image || post.image_url;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      
      <nav className="sticky top-0 z-50 bg-theme-bg/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center text-xs font-mono uppercase tracking-widest">
          <Link 
            href="/saved" 
            className="block py-4 pr-12 pl-4 -ml-4 hover:text-theme-title text-neutral-300 transition-colors"
          >
            ← Saved Index
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-neutral-500 border border-neutral-800 px-2 py-1">OFFLINE</span>
            <ThemeToggle />
          </div>
        </div>
        <ReadingProgress />
      </nav>

      <ScrollToTop />

      <article>
        {imageSrc && (
          <div className="w-full h-[50vh] md:h-[70vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-bg/50 to-theme-bg z-10"></div>
            <Image 
              src={imageSrc} 
              alt={formattedTitle} 
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <div className={`max-w-[1400px] mx-auto relative z-20 ${imageSrc ? '-mt-32 md:-mt-48' : 'pt-24'}`}>
          
          <div className="w-full max-w-[800px] mx-auto px-6">
            <header className="mb-14 text-center">
              <div className="inline-block px-6 py-3 mb-8 border border-neutral-800 bg-theme-bg text-xs font-mono text-neutral-500 uppercase tracking-widest shadow-2xl leading-8">
                <span className="opacity-100">{date}</span>
                
                {post.category && (
                  <>
                    <span className="text-neutral-500 mx-3">/</span>
                    <span className="text-theme-title font-bold tracking-[0.1em]">
                      {post.category}
                    </span>
                  </>
                )}

                {post.author && (
                  <>
                    <span className="text-neutral-500 mx-3">/</span>
                    {post.author.split(',').map((auth: string, index: number, arr: string[]) => {
                        const cleanAuthor = auth.trim();
                        if (!cleanAuthor) return null;
                        const isLast = index === arr.length - 1;
                        return (
                          <span key={index}>
                            <span className="text-theme-title font-bold tracking-[0.1em]">
                              {cleanAuthor}
                            </span>
                            {!isLast && <span className="text-neutral-500 mr-2">,</span>}
                          </span>
                        );
                    })}
                  </>
                )}

                {post.translator && (
                  <>
                    <span className="text-neutral-500 mx-3">/</span>
                    <span className="text-neutral-500 mr-2">ПЕРЕВОДЧИК:</span>
                    {post.translator.split(',').map((trans: string, index: number, arr: string[]) => {
                        const cleanTrans = trans.trim();
                        if (!cleanTrans) return null;
                        const isLast = index === arr.length - 1;
                        return (
                          <span key={index}>
                            <span className="text-theme-title font-bold tracking-[0.1em]">
                              {cleanTrans}
                            </span>
                            {!isLast && <span className="text-neutral-500 mr-2">,</span>}
                          </span>
                        );
                    })}
                  </>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] text-theme-title mb-6 drop-shadow-xl uppercase tracking-tighter">
                {formattedTitle}
              </h1>
              
              {post.excerpt && (
                  <div className="text-xl md:text-2xl font-serif italic text-neutral-400 mt-6 max-w-2xl mx-auto leading-relaxed">
                      {post.excerpt}
                  </div>
              )}
            </header>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,800px)_1fr] gap-8 justify-center items-start">
            
            <div className="hidden xl:block relative w-full h-full px-6">
              {isLongText && post.headings && <TableOfContents headings={post.headings} />}
            </div>

            <div className="w-full max-w-[800px] mx-auto px-6">
              
              {isLongText && post.headings && post.headings.length > 0 && (
                <details className="xl:hidden mb-10 border border-neutral-900 bg-theme-bg/50 group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none[&::-webkit-details-marker]:hidden">
                    <span className="text-[10px] font-[system-ui,sans-serif] font-medium text-neutral-500 uppercase tracking-widest">
                      Оглавление
                    </span>
                    <span className="text-neutral-500 text-[10px] transform transition-transform duration-300 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 pt-0">
                    <ul className="space-y-3 border-t border-neutral-900/50 pt-4">
                      {post.headings.map((heading: any) => (
                        <li 
                          key={heading.id}
                          style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
                        >
                          <a
                            href={`#${heading.id}`}
                            className="text-[11px] font-[system-ui,sans-serif] font-medium uppercase tracking-widest text-neutral-400 hover:text-white transition-colors block line-clamp-3 leading-relaxed"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              <div className="
                          article-content
                          prose prose-invert prose-p:text-xl max-w-none 
                          font-serif text-theme-article selection:bg-theme-title selection:text-theme-bg
                          
                          break-words prose-a:break-all
                          
                          prose-headings:font-serif prose-headings:font-medium prose-headings:text-theme-title prose-headings:uppercase prose-headings:tracking-tight
                          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                          prose-h3:text-2xl
                          
                          prose-a:text-theme-title prose-a:underline prose-a:decoration-neutral-600 prose-a:underline-offset-4 hover:prose-a:decoration-theme-title transition-all
                          
                          prose-p:leading-[1.6] prose-p:m-0[&_blockquote_p:not(:first-of-type)]:text-right [&_blockquote_p:not(:first-of-type)]:mt-4[&_blockquote_p:not(:first-of-type)]:text-theme-text[&_.text-3xl]:!mt-24 [&_.text-3xl]:!mb-0[&_.text-3xl]:block[&>div>*:first-child_.text-3xl]:!mt-0[&>div>*:first-child]:!mt-0
                        ">
                          <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              <div className="mt-24 mb-12 flex justify-center items-center select-none opacity-80">
                <span className="font-mono text-sm text-neutral-600 tracking-[0.3em] scale-125">
                  ***
                </span>
              </div>
            </div>

            <div className="hidden xl:block px-6"></div>
          </div>
        </div>
      </article>

      <footer className="mt-20 py-16 border-t border-neutral-900 text-center">
        <Link href="/saved" className="inline-block text-xs font-mono border border-neutral-800 px-8 py-4 hover:bg-theme-title hover:text-theme-bg transition-all uppercase tracking-widest">
          Вернуться к сохраненному
        </Link>
      </footer>
    </div>
  );
}