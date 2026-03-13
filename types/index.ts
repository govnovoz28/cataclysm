// ==========================================
// types\index.ts
// ==========================================
export type Post = {
  id: number
  slug: string | null
  title: string
  excerpt: string | null
  content: string
  image_url: string | null
  author: string | null
  translator: string | null
  category: string | null
  category_id: number | null
  is_featured: boolean
  views: number
  created_at: string
  user_id: string
  categories?: { title: string; slug: string } | { title: string; slug: string }[] | null
}

export type Author = {
  id: number
  name: string
  bio: string | null
}

export type Category = {
  id: number
  title: string
  slug: string
}