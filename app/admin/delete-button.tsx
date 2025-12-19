'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleDelete = async () => {
    if (!confirm('CONFIRM DELETION? This action creates a void.')) return
    
    setLoading(true)
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    
    if (error) {
      alert('ERROR: ' + error.message)
      setLoading(false)
    } else {
      router.refresh() // Обновляем страницу без перезагрузки
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest border border-red-900/30 px-3 py-1 hover:bg-red-950/20 transition-all"
    >
      {loading ? 'ERASING...' : 'DELETE'}
    </button>
  )
}