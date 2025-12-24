import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ViewCounter from '@/components/view-counter';

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

function capitalizeFirstLetter(string: string | null | undefined) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('title, content, image_url, author')
    .eq('id', id)
    .single();

  if (!post) {
    return { title: 'Статья не найдена' };
  }

  const formattedTitle = capitalizeFirstLetter(post.title);
  const cleanContent = post.content?.replace(/<[^>]*>?/gm, '') || '';
  
  const description = cleanContent
    ? cleanContent.slice(0, 150).replace(/\s+/g, ' ').trim() + '...'
    : 'Читать статью на cataclysm...';

  return {
    title: formattedTitle,
    description: description,
    openGraph: {
      title: formattedTitle,
      description: description,
      type: 'article',
      authors: post.author ? [post.author] : undefined,
      images: post.image_url
        ? [{ url: post.image_url, width: 1200, height: 630, alt: formattedTitle }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: description,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('*, views, categories(title, slug)')
    .eq('id', id)
    .single();
  
  if (!post) {
    notFound();
  }

  const category = Array.isArray(post.categories) ? post.categories[0] : post.categories;

  const formattedTitle = capitalizeFirstLetter(post.title);

  const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      <nav className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-neutral-900 py-4 px-6">
        <div className="max-w-[820px] mx-auto flex justify-between items-center text-xs font-mono uppercase tracking-widest">
          <Link href="/" className="hover:text-white text-[var(--muted)] transition-colors">← Index</Link>
        </div>
      </nav>

      <article>
        {post.image_url && (
          <div className="w-full h-[50vh] md:h-[70vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/20 to-[var(--background)] z-10"></div>
            <img 
              src={post.image_url} 
              alt={formattedTitle} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`max-w-[800px] mx-auto px-6 relative z-20 ${post.image_url ? '-mt-32 md:-mt-48' : 'pt-24'}`}>
          
          <header className="mb-14 text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-x-5 gap-y-2 px-6 py-3 mb-8 border border-neutral-800 bg-[var(--background)] text-xs font-mono text-neutral-500 uppercase tracking-widest shadow-2xl">
              <span className="opacity-100">{date}</span>
              
              {category && (
                <>
                  <span className="text-neutral-500">/</span>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-[#e5e5e5] font-bold tracking-[0.1em] hover:text-white transition-colors"
                  >
                    {category.title}
                  </Link>
                </>
              )}

              {post.author && (
                <>
                  <span className="text-neutral-500">/</span>
                  <Link 
                    href={`/author/${post.author}`}
                    className="text-[#e5e5e5] font-bold tracking-[0.1em] hover:text-white transition-colors"
                  >
                    {post.author}
                  </Link>
                </>
              )}

              <span className="text-neutral-500">/</span>
              <div className="text-[#e5e5e5] font-bold tracking-[0.1em]">
                <ViewCounter postId={post.id} initialViews={post.views || 0} />
              </div>
              
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] text-white mb-6 drop-shadow-xl uppercase tracking-tighter">
              {formattedTitle}
            </h1>
            
            {post.excerpt && (
                <div className="text-xl md:text-2xl font-serif italic text-neutral-400 mt-6 max-w-2xl mx-auto leading-relaxed">
                    {post.excerpt}
                </div>
            )}
          </header>

          <div className="
                      article-content
                      prose prose-invert prose-p:text-xl max-w-none 
                      font-serif text-[#d4d4d4] selection:bg-white selection:text-black
                      
                      prose-headings:font-serif prose-headings:font-medium prose-headings:text-white prose-headings:uppercase prose-headings:tracking-tight
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                      prose-h3:text-2xl
                      
                      prose-a:text-white prose-a:underline prose-a:decoration-neutral-600 prose-a:underline-offset-4 hover:prose-a:decoration-white transition-all
                      
                      prose-p:leading-[1.6] 
                      
                      [&_blockquote_p:not(:first-of-type)]:text-right
                      [&_blockquote_p:not(:first-of-type)]:mt-4
                      [&_blockquote_p:not(:first-of-type)]:text-[#e5e5e5]
                    ">
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

          <div className="mt-24 mb-12 flex justify-center items-center select-none opacity-80">
             <span className="font-mono text-sm text-neutral-600 tracking-[0.3em] scale-125">
               ***
             </span>
          </div>

        </div>
      </article>

      <footer className="mt-20 py-16 border-t border-neutral-900 text-center">
        <Link href="/" className="inline-block text-xs font-mono border border-neutral-800 px-8 py-4 hover:bg-white hover:text-black transition-all uppercase tracking-widest">
          Вернуться в главное меню
        </Link>
      </footer>
    </div>
  );
}
