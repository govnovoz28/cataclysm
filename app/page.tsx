// ==========================================
// app\post\[slug]\page.tsx
// ==========================================
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import ViewCounter from '@/components/view-counter';
import ReadingProgress from '@/components/reading-progress';
import ScrollToTop from '@/components/scroll-to-top';
import { ThemeToggle } from '@/components/theme-toggle';
import TableOfContents from '@/components/table-of-contents';
import type { Post } from '@/types';

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
};

function capitalizeFirstLetter(string: string | null | undefined) {
  if (!string) return '';
  const lower = string.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function extractHeadings(html: string) {
  if (!html) return { modifiedHtml: '', headings:[] };
  
  const headings: { id: string; text: string; level: number }[] =[];
  let counter = 0;
  
  const regex = /<(h[2-6]|span)([^>]*)>(.*?)<\/\1>/gi;
  
  let modifiedHtml = html.replace(regex, (match, tag, attrs, content) => {
    const isHeadingTag = /^h[2-6]$/i.test(tag);
    const isBigTextSpan = tag.toLowerCase() === 'span' && /class=["'][^"']*text-3xl[^"']*["']/i.test(attrs);
    
    if (!isHeadingTag && !isBigTextSpan) {
      return match;
    }

    const text = content.replace(/<[^>]+>/g, '').trim();
    if (!text) return match;
    
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : `heading-${counter++}`;
    
    const level = isHeadingTag ? parseInt(tag.charAt(1)) : 2;
    headings.push({ id, text, level });
    
    if (idMatch) return match;
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });

  // Обработка ручных списков "1) "
  modifiedHtml = modifiedHtml.replace(/<p([^>]*)>((?:\s|&nbsp;|<[^>]+>)*\d+\).*?)<\/p>/gi, (match, attrs, content) => {
    if (attrs.includes('manual-list-item')) return match;
    if (attrs.includes('class="')) {
      return `<p${attrs.replace('class="', 'class="manual-list-item ')}>${content}</p>`;
    }
    return `<p${attrs} class="manual-list-item">${content}</p>`;
  });

  return { modifiedHtml, headings };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let query = supabase.from('posts').select('title, content, excerpt, image_url, author');
  if (/^\d+$/.test(slug)) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data } = await query.single();
  const post = data as Post | null;

  if (!post) {
    return { title: 'Статья не найдена' };
  }

  const formattedTitle = capitalizeFirstLetter(post.title);
  const cleanContent = post.content?.replace(/<[^>]*>?/gm, '') || '';
  
  const description = post.excerpt || (cleanContent
    ? cleanContent.slice(0, 150).replace(/\s+/g, ' ').trim() + '...'
    : 'Читать статью на cataclysm...');

  return {
    title: formattedTitle,
    description: description,
    openGraph: {
      title: formattedTitle,
      description: description,
      type: 'article',
      authors: post.author ?[post.author] : undefined,
      images: post.image_url
        ?[{ url: post.image_url, width: 1200, height: 630, alt: formattedTitle }]
        :[],
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: description,
      images: post.image_url ?[post.image_url] :[],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  
  let query = supabase.from('posts').select('*, views, categories(title, slug)');
  if (/^\d+$/.test(slug)) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data } = await query.single();
  const post = data as Post | null;
  
  if (!post) {
    notFound();
  }

  const categoryRelation = Array.isArray(post.categories) ? post.categories[0] : post.categories;
  
  const displayCategory = categoryRelation?.title || post.category;
  const displaySlug = categoryRelation?.slug;

  const formattedTitle = capitalizeFirstLetter(post.title);

  const date = new Date(post.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const { modifiedHtml, headings } = extractHeadings((post.content || '').replace(/&nbsp;|\u00A0|&#160;/g, ' '));

  const cleanText = (post.content || '').replace(/<[^>]*>?/gm, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const isLongText = wordCount > 500; 

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      
      <nav className="sticky top-[-1px] z-50 bg-theme-bg/80 backdrop-blur-md border-b border-neutral-900 pt-[calc(env(safe-area-inset-top,0px)+1px)]">
        <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center text-xs font-mono uppercase tracking-widest">
          <Link 
            href="/" 
            className="block py-4 pr-12 pl-4 -ml-4 hover:text-theme-title text-neutral-300 transition-colors"
          >
            ← Index
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <ReadingProgress />
      </nav>

      <ScrollToTop />

      <article>
        {post.image_url && (
          <div className="w-full h-[50vh] md:h-[70vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-bg/50 to-theme-bg z-10"></div>
            <Image 
              src={post.image_url} 
              alt={formattedTitle} 
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <div className={`max-w-[1400px] mx-auto relative z-20 ${post.image_url ? '-mt-32 md:-mt-48' : 'pt-24'}`}>
          
          <div className="w-full max-w-[800px] mx-auto px-6">
            <header className="mb-14 text-center">
              <div className="inline-block max-w-full px-6 py-3 mb-8 border border-neutral-800 bg-theme-bg text-xs font-mono text-neutral-500 uppercase tracking-widest shadow-2xl leading-8 break-words">
                <span className="opacity-100">{date}</span>
                
                {displayCategory && (
                  <>
                    <span className="text-neutral-500 mx-3">/</span>
                    {displaySlug ? (
                      <Link 
                        href={`/category/${displaySlug}`}
                        className="text-theme-title font-bold tracking-[0.1em] hover:text-theme-text transition-colors"
                      >
                        {displayCategory}
                      </Link>
                    ) : (
                      <span className="text-theme-title font-bold tracking-[0.1em]">
                        {displayCategory}
                      </span>
                    )}
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
                            <Link 
                              href={`/author/${cleanAuthor}`}
                              className="text-theme-title font-bold tracking-[0.1em] hover:text-theme-text transition-colors"
                            >
                              {cleanAuthor}
                            </Link>
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
                            <Link 
                              href={`/author/${cleanTrans}`}
                              className="text-theme-title font-bold tracking-[0.1em] hover:text-theme-text transition-colors"
                            >
                              {cleanTrans}
                            </Link>
                            {!isLast && <span className="text-neutral-500 mr-2">,</span>}
                          </span>
                        );
                    })}
                  </>
                )}

                <span className="text-neutral-500 mx-3">/</span>
                <span className="text-theme-title font-bold tracking-[0.1em] inline-flex items-center align-middle">
                  <ViewCounter postId={post.id.toString()} initialViews={post.views || 0} />
                </span>
                
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] text-theme-title mb-6 drop-shadow-xl uppercase tracking-tighter break-words">
                {formattedTitle}
              </h1>
              
              {post.excerpt && (
                  <div className="text-xl md:text-2xl font-serif italic text-neutral-400 mt-6 max-w-2xl mx-auto leading-relaxed break-words">
                      {post.excerpt}
                  </div>
              )}
            </header>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,800px)_1fr] gap-8 justify-center items-start">
            
            <div className="hidden xl:block relative w-full h-full px-6">
              {isLongText && <TableOfContents headings={headings} />}
            </div>

            <div className="w-full max-w-[800px] mx-auto px-6">
              
              {isLongText && headings.length > 0 && (
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
                      {headings.map((heading) => (
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
                          
                          prose-p:leading-[1.6] prose-p:m-6[&_blockquote_p:not(:first-of-type)]:text-right[&_blockquote_p:not(:first-of-type)]:mt-4[&_blockquote_p:not(:first-of-type)]:text-theme-text[&_.text-3xl]:!mt-24[&_.text-3xl]:!mb-0[&_.text-3xl]:block[&>div>*:first-child_.text-3xl]:!mt-0[&>div>*:first-child]:!mt-0
                        ">
                          <div dangerouslySetInnerHTML={{ __html: modifiedHtml }} />
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
        <Link href="/" className="inline-block text-xs font-mono border border-neutral-800 px-8 py-4 hover:bg-theme-title hover:text-theme-bg transition-all uppercase tracking-widest">
          Вернуться в главное меню
        </Link>
      </footer>
    </div>
  );
}