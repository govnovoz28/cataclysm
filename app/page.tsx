// ==========================================
// app\page.tsx
// ==========================================
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link';
import Image from 'next/image'; 
import HeroSlider from '@/components/heroslider';
import Header from '@/components/header';
import type { Post, Category } from '@/types';

export const revalidate = 600;

const POSTS_PER_PAGE = 6;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return[] 
        },
      },
    }
  )

  const params = await searchParams;
  
  const currentPage = Number(params?.page) || 1;
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const[sliderData, postsData, categoriesData] = await Promise.all([
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, content, image_url, author, category, created_at, views, translator, categories(title, slug)')
      .eq('is_featured', true) 
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('posts')
      .select('id, slug, title, excerpt, content, image_url, author, created_at, category, views, translator, categories(title, slug)', { count: 'exact' }) 
      .order('created_at', { ascending: false })
      .range(from, to),
    
    supabase 
      .from('categories')
      .select('id, title, slug')
      .order('title', { ascending: true })
  ]);

  const sliderPosts = sliderData.data as Post[] | null;
  const posts = postsData.data as Post[] | null;
  const count = postsData.count;

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return[1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return[1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return[1, '...', current - 2, current - 1, current, current + 1, current + 2, '...', total];
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div 
      className="min-h-screen bg-theme-bg text-theme-text flex flex-col"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      
      <Header categories={(categoriesData.data as Category[]) ||[]} />

      {sliderPosts && sliderPosts.length > 0 && (
        <HeroSlider posts={sliderPosts} />
      )}

      <section className={`flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full ${sliderPosts && sliderPosts.length > 0 ? 'pt-0 md:pt-4' : 'pt-16'}`}>
        <div className="mb-10 flex items-center gap-4 select-none">
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
             <span className="font-mono text-[12px] uppercase tracking-widest text-neutral-500">
               Publications
             </span>
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
        </div>

        {posts && posts.length > 0 ? (
          <>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '3rem 1.5rem' }}
            >
              {posts.map((post) => {
                const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', year: 'numeric'
                });
                const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
                
                const catData = Array.isArray(post.categories) ? post.categories[0] : post.categories;
                const categoryName = catData?.title || post.category || 'POST';
                
                const titleLength = post.title.length;
                const viewsCount = post.views || 0; 

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
                    style={{ backgroundColor: 'rgb(var(--theme-card))', borderColor: 'rgb(var(--color-neutral-900))' }}
                  >
                    <Link 
                      href={`/post/${post.slug || post.id}`} 
                      className="block relative w-full h-64 overflow-hidden border-b border-neutral-900 flex-shrink-0"
                    >

                  {post.author && (
                    <div className="absolute top-0 left-0 z-20 flex flex-col items-start">
                      <object>
                        {post.author.split(',').map((auth: string, index: number) => {
                            const cleanAuthor = auth.trim();
                            if (!cleanAuthor) return null; 

                            return (
                              <Link 
                                key={index}
                                href={`/author/${cleanAuthor}`}
                                      className="block bg-black border-r border-b border-neutral-800 px-3 py-1 hover:bg-white group/author transition-colors cursor-pointer w-fit"
                                    >
                                      <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover/author:text-black">
                                        {cleanAuthor}
                                      </span>
                                    </Link>
                                );
                            })}
                          </object>
                        </div>
                      )}

                      {post.image_url ? (
                        <Image 
                          src={post.image_url} 
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

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs font-mono uppercase tracking-widest gap-2 mb-3 w-full text-neutral-500 flex-wrap">
                        <span>{date}</span>
                        <span className="text-neutral-700">/</span>
                        
                        {catData ? (
                            <Link 
                                href={`/category/${catData.slug}`} 
                                className="text-neutral-400 hover:text-white transition-colors font-semibold z-30 relative"
                            >
                                {catData.title}
                            </Link>
                        ) : (
                            <span className="text-neutral-400 font-semibold">{categoryName}</span>
                        )}

                        {post.translator && (
                          <>
                            <span className="text-neutral-700">/</span>
                            <span className="text-neutral-500">ПЕРЕВОДЧИК:</span>
                            <Link 
                                href={`/author/${post.translator}`} 
                                className="text-neutral-400 hover:text-white transition-colors font-semibold z-30 relative"
                            >
                                {post.translator}
                            </Link>
                          </>
                        )}
                        
                        <span className="text-neutral-700">/</span>
                        <span className="flex items-center gap-1 text-neutral-400" title="Просмотры">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="w-3 h-3 mb-[1px]"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          {viewsCount}
                        </span>
                        
                      </div>

                      <Link href={`/post/${post.slug || post.id}`} className="block w-full mb-4">
                        <h2 className={`font-serif font-bold uppercase text-theme-text group-hover:text-white transition-colors line-clamp-3 ${titleClass}`}>
                          {post.title}
                        </h2>
                      </Link>

                      {hasExcerpt && (
                        <p className="font-serif text-neutral-300 text-lg leading-7 line-clamp-4 mb-8 flex-grow opacity-95">
                            {post.excerpt}
                        </p>
                      )}

                      <Link href={`/post/${post.slug || post.id}`} className="inline-block text-[11px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mt-auto pt-4 border-t border-transparent group-hover:border-neutral-900">
                        Read Article &rarr;
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-20 pt-8 border-t border-neutral-900 font-mono text-xs uppercase tracking-widest w-full">
              <div className="flex justify-between items-center w-full max-w-[700px] mx-auto gap-2 md:gap-4">
                {hasPrevPage ? (
                  <Link 
                    href={`/?page=${currentPage - 1}`}
                    className="w-16 md:w-32 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-500 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                    </svg>
                  </Link>
                ) : (
                  <span className="w-16 md:w-32 h-10 flex items-center justify-center text-neutral-800 border border-neutral-900 cursor-not-allowed shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                    </svg>
                  </span>
                )}

                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {pageNumbers.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-neutral-500 select-none shrink-0">
                          ...
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={page}
                        href={`/?page=${page}`}
                        className={`w-10 h-10 flex items-center justify-center transition-colors border shrink-0 ${
                          page === currentPage
                            ? 'bg-neutral-200 text-black border-neutral-200'
                            : 'text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-500'
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  })}
                </div>

                {hasNextPage ? (
                  <Link 
                    href={`/?page=${currentPage + 1}`}
                    className="w-16 md:w-32 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-500 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                ) : (
                  <span className="w-16 md:w-32 h-10 flex items-center justify-center text-neutral-800 border border-neutral-900 cursor-not-allowed shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full min-h-[500px]">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 relative z-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col border border-neutral-900 h-full min-h-[450px]">
                    
                    <div className="h-64 border-b border-neutral-900 bg-theme-bg"></div>
                    
                    <div className="p-6 flex flex-col gap-6 flex-grow">
                        
                        <div className="flex gap-2">
                             <div className="h-2 w-16 bg-neutral-900"></div>
                             <div className="h-2 w-24 bg-neutral-900"></div>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="h-6 w-full bg-neutral-900"></div>
                             <div className="h-6 w-2/3 bg-neutral-900"></div>
                        </div>

                        <div className="space-y-2 mt-2">
                             <div className="h-2 w-full bg-neutral-900"></div>
                             <div className="h-2 w-full bg-neutral-900"></div>
                             <div className="h-2 w-1/2 bg-neutral-900"></div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-neutral-900 w-32">
                             <div className="h-3 w-full bg-neutral-900"></div>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="py-8 text-center border-t border-neutral-900 mt-auto bg-black">
        <p className="text-[15px] font-mono text-neutral-400 select-none">
          ВСЁ, ЧТО МОГЛО ПРОИЗОЙТИ - УЖЕ ПРОИЗОШЛО
          </p>
          <p className="text-[14px] font-mono text-neutral-500 select-none">
          cataclysm journal / {new Date().getFullYear()} 
        </p>
      </footer>
    </div>
  );
}