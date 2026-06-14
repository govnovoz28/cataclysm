// ==========================================
// app\category\[slug]\page.tsx
// ==========================================
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl'
import Image from 'next/image';
import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import type { Post, Category } from '@/types';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight:['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 4;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data } = await supabase
    .from('categories')
    .select('title')
    .eq('slug', slug)
    .single();

  const category = data as Category | null;

  if (!category) return { title: 'Категория не найдена' };

  return {
    title: `${category.title} | cataclysm`,
    description: `Все статьи в категории ${category.title}`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: catData } = await supabase
    .from('categories')
    .select('id, title')
    .eq('slug', slug)
    .single();

  const category = catData as Category | null;

  if (!category) {
    notFound();
  }

  const { data: postsData, count } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, created_at, image_url, author, translator, views', { count: 'exact' })
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  const posts = postsData as Post[] | null;

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
                {category.title}
                </h1>
                <p className="font-mono text-[12px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default text-center">
                Category Materials 
                </p>
            </div>

            <div className="hidden md:block order-3"></div>
        </div>
      </header>

      <section className="flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full pt-0 md:pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {posts?.map((post) => {
            const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric'
            });
            
            const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
            const categoryName = category.title;
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
              >
                <Link 
                  href={`/post/${post.slug || post.id}`} 
                  className="block relative w-full h-64 overflow-hidden border-b border-neutral-900 flex-shrink-0"
                >
                  {post.image_url ? (
                    <Image 
                      src={getImageUrl(post.image_url)}
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
                    Read Protocol &rarr;
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-20 pt-8 border-t border-neutral-900 font-mono text-xs uppercase tracking-widest w-full">
            <div className="flex justify-between items-center w-full max-w-[700px] mx-auto gap-2 md:gap-4">
              {hasPrevPage ? (
                <Link 
                  href={`/category/${slug}?page=${currentPage - 1}`}
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
                      href={`/category/${slug}?page=${page}`}
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
                  href={`/category/${slug}?page=${currentPage + 1}`}
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
        )}

        {(!posts || posts.length === 0) && (
            <div className="text-center py-20 border border-dashed border-neutral-900 mt-10">
                <p className="font-mono text-neutral-600 uppercase tracking-widest text-xs">
                    // No data found in category archives
                </p>
                <p className="text-[10px] text-neutral-700 mt-2 font-mono">
                    System updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        )}
      </section>
    </div>
  );
}