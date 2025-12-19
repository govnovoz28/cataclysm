import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link';
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
  // 1. Создаем клиент Supabase (Server Component Style)
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

  // 2. Проверяем, залогинен ли пользователь (чтобы поменять кнопку в хедере)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. СЛАЙДЕР
  const { data: sliderPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, image_url, author, category, created_at')
    .eq('is_featured', true) 
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. СЕТКА
  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, image_url, author, created_at, category', { count: 'exact' }) 
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      
      <header className="border-b border-neutral-900 mb-0">
        <div className="max-w-[1750px] mx-auto relative py-12 px-6 text-center">
            
            <div className="absolute right-6 top-6 md:top-auto md:bottom-12">
                {/* Меняем кнопку в зависимости от статуса входа */}
                <Link 
                    href="/admin" 
                    className={`text-sm font-mono uppercase tracking-widest transition-colors ${user ? 'text-green-500 hover:text-green-400' : 'text-neutral-600 hover:text-white'}`}
                >
                    {user ? '[ CONTROL PANEL ]' : '[ LOGIN ]'}
                </Link>
            </div>

            <h1 className={`${orbitron.className} text-5xl md:text-6xl font-bold tracking-normal mb-2 lowercase select-none cursor-default text-white`}>
            cataclysm
            </h1>
            <p className="font-mono text-[13px] text-[var(--muted)] tracking-[0.2em] uppercase select-none cursor-default">
            ACCD and Layer-culture research
            </p>
        </div>
      </header>

      {sliderPosts && sliderPosts.length > 0 && (
        <HeroSlider posts={sliderPosts} />
      )}

      <section className={`flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full ${sliderPosts && sliderPosts.length > 0 ? 'pt-0 md:pt-4' : 'pt-16'}`}>
        <div className="mb-10 flex items-center gap-4 select-none">
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
             <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
               Latest Articles
             </span>
             <span className="h-[1px] bg-neutral-900 flex-grow"></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {posts?.map((post) => {
            const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric'
            });
            const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
            const categoryName = post.category || 'POST';
            const titleLength = post.title.length;

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
                    <div className="absolute top-0 left-0 z-20">
                      <object>
                        <Link 
                          href={`/author/${post.author}`}
                          className="block bg-black border-r border-b border-neutral-800 px-3 py-1 hover:bg-white group/author transition-colors cursor-pointer"
                        >
                          <span className="font-mono text-[10px] font-bold text-white uppercase tracking-widest group-hover/author:text-black">
                            {post.author}
                          </span>
                        </Link>
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
                    <span className="text-neutral-400 font-semibold">{categoryName}</span>
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

          <span className="text-neutral-600 select-none">
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