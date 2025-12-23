import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      { 
}
      <nav className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-neutral-900 py-4 px-6">
        <div className="max-w-[820px] mx-auto flex justify-between items-center text-xs font-mono uppercase tracking-widest">
          <Link href="/" className="hover:text-white text-[var(--muted)] transition-colors">← Index</Link>
          { 
}
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        
        { 
}
        <header className="mb-20 text-center">
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-[0.2em] mb-4 block">
            Категория
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-tighter">
            {category.title}
          </h1>
        </header>

        { 
}
        {!posts || posts.length === 0 ? (
          <div className="text-center text-neutral-500 font-mono text-sm py-20">
            В этой категории пока нет записей.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {posts.map((post) => {
              const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              });

              const hasExcerpt = post.excerpt && post.excerpt.trim().length > 0;
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
                      { 
}
                      {post.author && (
                        <div className="absolute top-0 left-0 z-20">
                          <object>
                            <Link 
                                href={`/author/${post.author}`}
                                className="block bg-black border-r border-b border-neutral-800 px-3 py-1 hover:bg-white group/author transition-colors cursor-pointer"
                            >
                              <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover/author:text-black">
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
                      
                      { 
}
                      <div className="flex items-center text-xs font-mono uppercase tracking-widest gap-2 mb-3 w-full text-neutral-500">
                        <span>{date}</span>
                        <span className="text-neutral-700">/</span>
                        <span className="text-neutral-400 font-semibold">{category.title}</span>
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
        )}
        
      </main>

      <footer className="mt-20 py-16 border-t border-neutral-900 text-center">
        <Link href="/" className="inline-block text-xs font-mono border border-neutral-800 px-8 py-4 hover:bg-white hover:text-black transition-all uppercase tracking-widest">
          Вернуться в главное меню
        </Link>
      </footer>
    </div>
  );
}