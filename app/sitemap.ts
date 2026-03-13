// ==========================================
// app\sitemap.ts
// ==========================================
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cataclysm-accd.vercel.app'

  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, created_at')

  const postsUrls = (posts ||[]).map((post) => ({
    url: `${baseUrl}/post/${post.slug || post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return[
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postsUrls,
  ]
}