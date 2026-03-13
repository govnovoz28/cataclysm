'use client'

import { useState, useEffect } from 'react'
import { get, set } from 'idb-keyval'

export default function SaveButton({ post }: { post: any }) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    get('saved_posts').then((posts: any[]) => {
      if (posts && posts.find(p => p.id === post.id)) {
        setIsSaved(true)
      }
    })
  }, [post.id])

  const handleToggleSave = async () => {
    setIsLoading(true)
    try {
      let posts = await get('saved_posts') ||[]
      if (isSaved) {
        posts = posts.filter((p: any) => p.id !== post.id)
        await set('saved_posts', posts)
        setIsSaved(false)
      } else {
        let base64Image = null
        if (post.image_url) {
          try {
            const res = await fetch(post.image_url)
            const blob = await res.blob()
            base64Image = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.readAsDataURL(blob)
            })
          } catch (e) {
            console.error('Failed to fetch image for offline', e)
          }
        }
        posts.push({ ...post, offline_image: base64Image, saved_at: Date.now() })
        await set('saved_posts', posts)
        setIsSaved(true)
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  if (!mounted) return <div className="w-10 h-10"></div>

  return (
    <button
    onClick={handleToggleSave}
    disabled={isLoading}
    className={`flex items-center justify-center p-2 border border-transparent transition-colors group ${
        isLoading ? 'opacity-50 cursor-not-allowed' : '' 
    } ${
        isSaved
        ? 'text-neutral-400' // Сделали еще темнее (был 400)
        : 'text-neutral-500 hover:text-neutral-300'
    }`}
    title={isSaved ? "Удалить из оффлайна" : "Сохранить оффлайн"}
    >
    {isLoading ? (
        <span className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin"></span>
    ) : isSaved ? (
        <svg xmlns="http://www.w3.org" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    )}
    </button>
  )
}