import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: category } = await supabase
    .from('categories')
    .select('title')
    .eq('slug', slug)
    .single();

  if (!category) return { title: 'Категория не найдена' };

  return {
    title: `${category.title} | Cataclysm`,
    description: `Все статьи в категории ${category.title}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const { data: category } = await supabase
    .from('categories')
    .select('id, title')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, created_at, image_url, author')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <header className="py-16 px-6 text-center border-b border-neutral-900 mb-0 relative bg-[#0a0a0a] overflow-hidden">
         
         <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
            <div className="relative w-[500px] h-[500px] opacity-[0.04] mix-blend-screen blur-[1px]">
                <Image 
                    src="/logo.png" 
                    alt="" 
                    fill
                    className="object-contain"
                />
            </div>
        </div>

         <div className="absolute top-8 left-8 z-20">
            <Link href="/" className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border border-transparent hover:border-neutral-800 px-4 py-2.5">
            ← Return to Index
            </Link>
        </div>

        <div className="relative z-10">
            <h1 className={`${orbitron.className} text-4xl md:text-6xl font-bold tracking-normal mb-2 text-white uppercase`}>
            {category.title}
            </h1>
            <p className="font-mono text-[13px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default">
            Category Archives 
            </p>
        </div>
      </header>

      <section className="flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {posts?.map((post) => {
            const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric'
            });
            
            const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
            const categoryName = category.title;
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
                {/* 1. Ссылка только на картинку (чтобы не было вложенных ссылок) */}
                <Link 
                  href={`/post/${post.id}`} 
                  className="block relative w-full h-64 overflow-hidden border-b border-neutral-900 flex-shrink-0"
                >
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

                {/* 2. Блок авторов вынесен отдельно и позиционирован абсолютно поверх картинки */}
                {post.author && (
                    <div className="absolute top-0 left-0 z-20 flex flex-wrap max-w-full pointer-events-none">
                        {post.author.split(',').map((authorName: string, index: number) => {
                            const cleanName = authorName.trim();
                            if (!cleanName) return null;

                            return (
                                <Link 
                                    key={index}
                                    href={`/author/${cleanName}`}
                                    className="pointer-events-auto block bg-black border-r border-b border-neutral-800 px-3 py-1 group/author cursor-pointer hover:bg-white transition-colors"
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
                    Read Protocol &rarr;
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

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
