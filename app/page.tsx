import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link';
import Image from 'next/image'; 
import HeroSlider from '@/components/heroslider';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const revalidate = 0;

const POSTS_PER_PAGE = 6;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const params = await searchParams;
  
  const currentPage = Number(params?.page) || 1;
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const { data: { user } } = await supabase.auth.getUser()
  const { data: sliderPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, image_url, author, category, created_at, views, categories(title, slug)')
    .eq('is_featured', true) 
    .order('created_at', { ascending: false })
    .limit(5);
  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, image_url, author, created_at, category, views, categories(title, slug)', { count: 'exact' }) 
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      
      <header className="border-b border-neutral-900 mb-8 relative overflow-hidden">
          <div className="max-w-[1750px] mx-auto relative py-6 px-6 z-10 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-end gap-y-4 md:gap-y-0">
              
              <div className="hidden md:block"></div>

              <div className="flex items-end justify-center gap-4 select-none w-full md:w-auto md:order-2">
                  <div className="relative w-12 h-12 md:w-[74px] md:h-[74px] flex-shrink-0 z-10 mb-[2px]">
                          <Image 
                          src="/logo.png" 
                          alt="Cataclysm Logo"
                          fill
                          className="object-contain opacity-100"
                      />
                  </div>

                  <div className="flex flex-col items-center justify-end">
                      <h1 className={`${orbitron.className} text-5xl md:text-6xl font-bold tracking-normal lowercase cursor-default text-white drop-shadow-2xl leading-[0.85] mb-1 text-center`}>
                          cataclysm
                      </h1>

                      <p className="font-mono text-[11px] md:text-[13px] text-[var(--muted)] tracking-[0.2em] uppercase select-none cursor-default text-center">
                          ACCD and Layer-culture research
                      </p>
                  </div>
              </div>

              <div className="flex justify-end w-full md:w-auto order-1 md:order-3 md:mb-[6px] z-20">
                  <Link 
                      href="/admin" 
                      className={`text-sm font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${user ? 'text-green-500 hover:text-green-400' : 'text-neutral-600 hover:text-white'}`}
                  >
                      {user ? '[ CONTROL PANEL ]' : '[ LOGIN ]'}
                  </Link>
              </div>

          </div>
      </header>

      {sliderPosts && sliderPosts.length > 0 && (
        <HeroSlider posts={sliderPosts} />
      )}

      <section className={`flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full ${sliderPosts && sliderPosts.length > 0 ? 'pt-0 md:pt-4' : 'pt-16'}`}>
        <div className="mb-10 flex items-center gap-4 select-none">
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
             <span className="font-mono text-[12px] uppercase tracking-widest text-neutral-500">
               Latest Articles
             </span>
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
        </div>

        {posts && posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
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
                    className="group flex flex-col bg-[#111] border border-neutral-900 hover:border-neutral-700 transition-colors duration-300 relative"
                  >
                    <Link 
                      href={`/post/${post.id}`} 
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
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
                          <span className="font-mono text-[9px] text-neutral-800">NO_IMG_DATA</span>
                        </div>
                      )}
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs font-mono uppercase tracking-widest gap-2 mb-3 w-full text-neutral-500">
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
                        
                        <span className="text-neutral-700 ml-auto md:ml-0">/</span>
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

                      <Link href={`/post/${post.id}`} className="block w-full mb-4">
                        <h2 className={`font-serif font-bold uppercase text-[#e5e5e5] group-hover:text-white transition-colors line-clamp-3 ${titleClass}`}>
                          {post.title}
                        </h2>
                      </Link>

                      {hasExcerpt && (
                        <p className="font-serif text-neutral-300 text-lg leading-7 line-clamp-4 mb-8 flex-grow opacity-95">
                            {post.excerpt}
                        </p>
                      )}

                      <Link href={`/post/${post.id}`} className="inline-block text-[11px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mt-auto pt-4 border-t border-transparent group-hover:border-neutral-900">
                        Read Article &rarr;
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-20 pt-8 border-t border-neutral-900 font-mono text-xs uppercase tracking-widest">
              {hasPrevPage ? (
                <Link 
                  href={`/?page=${currentPage - 1}`}
                  className="text-neutral-400 hover:text-white transition-colors px-4 py-2 border border-neutral-800 hover:border-neutral-500"
                >
                  &larr; Prev Page
                </Link>
              ) : (
                <span className="text-neutral-800 px-4 py-2 border border-neutral-900 cursor-not-allowed">
                  &larr; Prev Page
                </span>
              )}

              <span className="text-neutral-600 select-none text-sm">
                Page {currentPage} / {totalPages}
              </span>

              {hasNextPage ? (
                <Link 
                  href={`/?page=${currentPage + 1}`}
                  className="text-neutral-400 hover:text-white transition-colors px-4 py-2 border border-neutral-800 hover:border-neutral-500"
                >
                  Next Page &rarr;
                </Link>
              ) : (
                <span className="text-neutral-800 px-4 py-2 border border-neutral-900 cursor-not-allowed">
                  Next Page &rarr;
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="relative w-full min-h-[500px]">
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                 <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-[0.02] grayscale">
                     <Image
                         src="/logo.png"
                         alt="System Void"
                         fill
                         className="object-contain"
                     />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 relative z-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col border border-neutral-900 h-full min-h-[450px]">
                    
                    <div className="h-64 border-b border-neutral-900 bg-[#0a0a0a]"></div>
                    
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
