'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import TextareaAutosize from 'react-textarea-autosize' 
import Link from 'next/link'
import TiptapEditor from '@/components/tiptapeditor'

type Post = {
  id: number
  title: string
  excerpt: string | null
  content: string 
  image_url: string | null
  author: string | null
  category: string | null
  is_featured: boolean
  views: number
  created_at: string
  user_id: string 
}

export default function AdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('') 
  const [authorName, setAuthorName] = useState('') 
  const [category, setCategory] = useState('статья')
  const [isFeatured, setIsFeatured] = useState(false)
  
  const [originalPost, setOriginalPost] = useState<Post | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showCancelButton = !!editingId || !!title || !!excerpt || !!content || !!imageUrl || !!authorName

  useEffect(() => {
    const initAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCurrentUserId(user.id)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            
            if (profile && profile.role === 'admin') {
                setIsAdmin(true)
            }
        }
        setIsCheckingAuth(false)
    }
    
    initAuth()
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data as Post[])
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = activeFilter === 'all' || post.category === activeFilter

      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, activeFilter])

  const canManagePost = (post: Post) => {
      if (!currentUserId) return false
      if (isAdmin) return true 
      return post.user_id === currentUserId 
  }

  const toggleFeaturedStatus = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation()
    
    if (!canManagePost(post)) {
        alert('Нет прав на изменение этой записи.')
        return
    }

    const newStatus = !post.is_featured
    setPosts(posts.map(p => p.id === post.id ? { ...p, is_featured: newStatus } : p))

    if (editingId === post.id) {
        setIsFeatured(newStatus)
    }

    const { error } = await supabase
        .from('posts')
        .update({ is_featured: newStatus })
        .eq('id', post.id)

    if (error) {
        alert('Ошибка обновления статуса: ' + error.message)
        fetchPosts() 
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
      setUploading(false)
    } catch (error: any) {
      alert('Ошибка загрузки: ' + error.message)
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    uploadFile(e.target.files[0])
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) uploadFile(file)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleEditClick = (post: Post) => {
    if (!canManagePost(post)) {
        alert('Доступ к редактированию чужой записи запрещен.')
        return
    }

    setTitle(post.title)
    setExcerpt(post.excerpt || '')
    setContent(post.content || '')
    setImageUrl(post.image_url || '')
    setAuthorName(post.author || '') 
    setCategory(post.category || 'статья')
    setIsFeatured(post.is_featured || false)
    setEditingId(post.id)
    setOriginalPost(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setTitle('')
    setExcerpt('')
    setContent('')
    setImageUrl('')
    setAuthorName('')
    setCategory('статья')
    setIsFeatured(false)
    setEditingId(null)
    setOriginalPost(null)
  }

  const handleCancelEdit = () => {
    let hasChanges = false;

    if (editingId && originalPost) {
        hasChanges = 
            title !== originalPost.title ||
            content !== originalPost.content ||
            excerpt !== (originalPost.excerpt || '') ||
            imageUrl !== (originalPost.image_url || '') ||
            authorName !== (originalPost.author || '') ||
            category !== (originalPost.category || 'статья') ||
            isFeatured !== originalPost.is_featured;
    } else {
        hasChanges = !!title || !!excerpt || !!content || !!imageUrl || !!authorName;
    }

    if (hasChanges) {
        if (!window.confirm('Отменить изменения?')) {
            return;
        }
    }

    resetForm();
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content || !currentUserId) return
    setLoading(true)

    const payload = { 
      title, 
      excerpt: excerpt.trim() === '' ? null : excerpt,
      content, 
      image_url: imageUrl.trim() === '' ? null : imageUrl,
      author: authorName.trim() === '' ? null : authorName,
      category,
      is_featured: isFeatured,
      user_id: currentUserId 
    }

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', editingId)
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('posts')
        .insert([payload])
      error = insertError;
    }

    if (error) {
      alert('Ошибка: ' + error.message)
      setLoading(false)
    } else {
      resetForm()
      setLoading(false)
      fetchPosts() 
    }
  }

  const handleDelete = async (post: Post) => {
    if (!canManagePost(post)) {
        alert('Удаление запрещено.')
        return
    }

    if (!window.confirm('Удалить запись безвозвратно?')) return
    
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
        alert('Ошибка удаления: ' + error.message)
    } else {
      if (editingId === post.id) {
          resetForm()
      }
      setPosts(posts.filter((p) => p.id !== post.id))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-white selection:text-black" onPaste={handlePaste}>
      
      <nav className="border-b border-neutral-800 px-6 py-4 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="text-sm font-mono text-neutral-400 pl-5 flex items-center gap-4">
            <Link 
                href="/" 
                className="hover:text-white transition-colors uppercase tracking-widest"
            >
                [ SITE ]
            </Link>
            {!isCheckingAuth && (
                 <span className={`text-[10px] border px-2 py-0.5 uppercase tracking-widest ${isAdmin ? 'border-purple-900 text-purple-400' : 'border-blue-900 text-blue-400'}`}>
                    {isAdmin ? 'ROOT' : 'AUTHOR'}
                 </span>
            )}
          </div>
          <div className="flex gap-6 text-sm font-mono pr-5">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-red-900 hover:text-red-500 uppercase tracking-widest transition-colors">
              [ LOG OUT ]
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12 pb-32 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-8">
            
            <div 
              className={`
                border border-dashed border-neutral-800 bg-neutral-900/20 p-8 text-center transition-all cursor-pointer rounded-sm
                ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-neutral-500 hover:bg-neutral-900/40'}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              {uploading ? (
                <div className="text-xs font-mono text-white animate-pulse">ЗАГРУЗКА...</div>
              ) : imageUrl ? (
                 <div className="relative group">
                    <img src={imageUrl} alt="Preview" className="h-48 mx-auto object-cover border border-neutral-700" />
                    <div className="text-[10px] font-mono text-neutral-400 mt-2">НАЖМИТЕ ДЛЯ ЗАМЕНЫ</div>
                 </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="text-neutral-500 text-2xl">+</div>
                  <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                    Обложка (Image)
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5">
                    <input
                        type="text"
                        placeholder="Имя автора"
                        className="w-full bg-transparent border-b border-neutral-800 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-white focus:outline-none transition-colors font-mono"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                    />
                </div>
                <div className="md:col-span-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#0a0a0a] border-b border-neutral-800 text-sm text-neutral-200 p-3 font-mono focus:outline-none focus:border-white transition-colors appearance-none uppercase rounded-none"
                    >
                        <option value="статья">СТАТЬЯ</option>
                        <option value="перевод">ПЕРЕВОД</option>
                        <option value="пост">ПОСТ</option>
                    </select>
                </div>
                <div className="md:col-span-3 flex justify-end">
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${isFeatured ? 'bg-white border-white' : 'border-neutral-700 group-hover:border-neutral-500'}`}>
                           {isFeatured && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className={`text-[12px] font-mono uppercase tracking-widest ${isFeatured ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                           В СЛАЙДЕР
                        </span>
                        <input type="checkbox" className="hidden" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-0"> 
                <TextareaAutosize
                    placeholder="ЗАГОЛОВОК"
                    className="w-full bg-transparent resize-none border-none outline-none text-5xl md:text-6xl font-serif font-bold placeholder:text-neutral-800 text-white leading-[0.9] tracking-tight uppercase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    minRows={1}
                />
                <TextareaAutosize
                    placeholder="Лид-абзац..."
                    className="w-full bg-transparent resize-none border-none outline-none text-xl md:text-2xl font-serif italic text-neutral-400 placeholder:text-neutral-800 leading-relaxed -mt-2"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    minRows={1}
                />
                
                <div className="mt-8">
                   <TiptapEditor 
                      content={content} 
                      onChange={(newContent) => setContent(newContent)} 
                   />
                </div>

            </div>
        </div>

        <div className="lg:col-span-1 border-l border-neutral-900 pl-8 hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          
          <div className="mb-8 space-y-4">
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="ПОИСК..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-800 pb-2 text-xs font-mono uppercase tracking-widest text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-colors"
                />
             </div>
             
             <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest">
                <button 
                    onClick={() => setActiveFilter('all')} 
                    className={`px-2 py-1 border transition-colors ${activeFilter === 'all' ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                >
                    ALL
                </button>
                <button 
                    onClick={() => setActiveFilter('статья')} 
                    className={`px-2 py-1 border transition-colors ${activeFilter === 'статья' ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                >
                    СТАТЬИ
                </button>
                <button 
                    onClick={() => setActiveFilter('перевод')} 
                    className={`px-2 py-1 border transition-colors ${activeFilter === 'перевод' ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                >
                    ПЕРЕВОДЫ
                </button>
                <button 
                    onClick={() => setActiveFilter('пост')} 
                    className={`px-2 py-1 border transition-colors ${activeFilter === 'пост' ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                >
                    ПОСТЫ
                </button>
             </div>
          </div>

          <h2 className="text-[10px] font-mono text-neutral-500 mb-6 tracking-[0.2em] uppercase">
             INDEX ({filteredPosts.length})
          </h2>

          <div className="space-y-6 pb-20">
            {filteredPosts.map((post) => {
              const allowed = canManagePost(post);
              return (
                <div 
                  key={post.id} 
                  className={`
                    group pb-4 border-b transition-all relative
                    ${editingId === post.id 
                        ? 'opacity-100 border-white bg-neutral-900/30 -mx-2 px-2 rounded' 
                        : allowed 
                            ? 'opacity-60 hover:opacity-100 border-neutral-900 cursor-pointer' 
                            : 'opacity-30 border-neutral-900 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                     <div onClick={() => allowed && handleEditClick(post)} className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            {!allowed && <span className="text-[9px] text-red-900 border border-red-900/50 px-1 font-mono uppercase">LOCKED</span>}
                            <h3 className={`text-base font-serif font-bold uppercase leading-none transition-colors ${allowed ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-500'}`}>
                                {post.title}
                            </h3>
                        </div>
                        <div className="flex gap-4 text-[9px] font-mono text-neutral-500 uppercase items-center">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.category && (
                              <span className="text-neutral-600 border border-neutral-800 px-1">
                                {post.category}
                              </span>
                          )}
                        </div>
                     </div>
                     
                     {allowed && (
                         <div className="flex flex-col gap-2 items-center">
                             <button 
                               onClick={(e) => toggleFeaturedStatus(e, post)} 
                               title="Слайдер"
                               className={`text-lg leading-none transition-colors ${post.is_featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-neutral-800 hover:text-neutral-400'}`}
                             >
                               ★
                             </button>

                             <button onClick={() => handleDelete(post)} className="text-neutral-700 hover:text-red-700 transition-colors text-sm font-mono">x</button>
                         </div>
                     )}
                  </div>
                </div>
              )
            })}
            
            {filteredPosts.length === 0 && (
                <div className="text-center py-10 text-neutral-600 font-mono text-xs uppercase">
                    Ничего не найдено
                </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-neutral-900 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex justify-end gap-6 items-center">
                {showCancelButton && (
                  <button 
                    onClick={handleCancelEdit} 
                    className="px-6 py-3 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    ОТМЕНА
                  </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !title}
                    className="px-10 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'СОХРАНЕНИЕ...' : editingId ? 'ОБНОВИТЬ' : 'ОПУБЛИКОВАТЬ'}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}