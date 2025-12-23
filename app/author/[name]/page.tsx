import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const revalidate = 0;

export default async function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const authorName = decodeURIComponent(name);

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, image_url, author, created_at, category') 
    .eq('author', authorName)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <header className="py-16 px-6 text-center border-b border-neutral-900 mb-0 relative bg-[#0a0a0a]">
         <div className="absolute top-8 left-8">
            { 
}
            <Link href="/" className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border border-transparent hover:border-neutral-800 px-4 py-2.5">
            ← Return to Index
            </Link>
        </div>

        <h1 className={`${orbitron.className} text-4xl md:text-6xl font-bold tracking-normal mb-2 text-white`}>
          {authorName}
        </h1>
        <p className="font-mono text-[13px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default">
          Subject Archives 
        </p>
      </header>

      <section className="flex-grow max-w-[1200px] mx-auto px-4 pb-16 w-full pt-16">
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
                        <div className="block bg-black border-r border-b border-neutral-800 px-3 py-1 group/author cursor-default">
                          <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest">
                            {post.author}
                          </span>
                        </div>
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
                    
                </p>
                <p className="text-[10px] text-neutral-700 mt-2 font-mono">
                    Check if database entry matches exactly (Case Sensitive).
                </p>
            </div>
        )}
      </section>
    </div>
  );
}