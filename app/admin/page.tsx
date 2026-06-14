// ==========================================
// app\admin\page.tsx
// ==========================================
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import TextareaAutosize from 'react-textarea-autosize' 
import { getImageUrl } from '@/utils/imageUrl';
import Link from 'next/link'
import TiptapEditor from '@/components/tiptapeditor'
import type { Post, Author, Category } from '@/types'

const ADMIN_AUTHORS =[
    'wookazo',
    'Кирилл Хорохордин',
    'Рустам Тишков'
]

const AuthorAutocomplete = ({ 
    value, 
    onChange, 
    placeholder, 
    suggestions 
}: { 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string, 
    suggestions: Author[] 
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false)
    
    const filtered = useMemo(() => {
        if (!value) {
            return suggestions.filter(s => ADMIN_AUTHORS.includes(s.name))
        }
        return suggestions.filter(s => 
            s.name.toLowerCase().includes(value.toLowerCase())
        )
    },[value, suggestions])

    return (
        <div className="relative group w-full">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-neutral-800 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-white focus:outline-none transition-colors font-mono"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {showSuggestions && filtered.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full bg-[#0a0a0a] border border-neutral-800 max-h-48 overflow-y-auto custom-scrollbar shadow-2xl">
                    {filtered.map(author => (
                        <div 
                            key={author.id}
                            className="px-4 py-2 text-[10px] font-mono text-neutral-400 hover:bg-white hover:text-black cursor-pointer transition-colors uppercase tracking-widest border-b border-neutral-900 last:border-0"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                onChange(author.name)
                                setShowSuggestions(false)
                            }}
                        >
                            {author.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const generateSlug = (text: string) => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
  };
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, match => map[match] || match)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export default function AdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const[activeTab, setActiveTab] = useState<'posts' | 'authors'>('posts')

  const[title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const[excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const[imageUrl, setImageUrl] = useState('') 
  
  const[authorName, setAuthorName] = useState('') 
  const [translatorName, setTranslatorName] = useState('')

  const[dbCategories, setDbCategories] = useState<Category[]>([]) 
  const [category, setCategory] = useState('') 
  const[categoryId, setCategoryId] = useState<number | null>(null) 

  const [isFeatured, setIsFeatured] = useState(false)
  
  const[originalPost, setOriginalPost] = useState<Post | null>(null)

  const [loading, setLoading] = useState(false)
  const[uploading, setUploading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const[dbAuthors, setDbAuthors] = useState<Author[]>([])
  const[authFormName, setAuthFormName] = useState('')
  const[authFormBio, setAuthFormBio] = useState('')
  const [editingAuthorId, setEditingAuthorId] = useState<number | null>(null)
  const[originalAuthor, setOriginalAuthor] = useState<{name: string, bio: string} | null>(null)
  
  const [authorSearchQuery, setAuthorSearchQuery] = useState('')

  const[currentUserId, setCurrentUserId] = useState<string | null>(null)
  const[currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const[isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const normalizeContent = (html: string) => {
    if (!html) return ''
    if (html === '<p></p>') return ''
    return html
  }

  const hasChanges = useMemo(() => {
    if (!editingId || !originalPost) return false
    
    const currentContent = normalizeContent(content)
    const originalContent = normalizeContent(originalPost.content || '')

    return (
      title !== originalPost.title ||
      slug !== (originalPost.slug || '') ||
      currentContent !== originalContent ||
      (excerpt || '') !== (originalPost.excerpt || '') ||
      (imageUrl || '') !== (originalPost.image_url || '') ||
      (authorName || '') !== (originalPost.author || '') ||
      (translatorName || '') !== (originalPost.translator || '') ||
      category !== (originalPost.category || '') ||
      categoryId !== (originalPost.category_id || null) || 
      isFeatured !== originalPost.is_featured
    )
  },[title, slug, excerpt, content, imageUrl, authorName, translatorName, category, categoryId, isFeatured, editingId, originalPost])

  const hasAuthorChanges = useMemo(() => {
      if (!editingAuthorId) {
          return !!authFormName || !!authFormBio
      }
      if (originalAuthor) {
          return authFormName !== originalAuthor.name || authFormBio !== originalAuthor.bio
      }
      return false
  },[editingAuthorId, authFormName, authFormBio, originalAuthor])

  const showCancelButton = !!editingId || !!title || !!excerpt || !!normalizeContent(content) || !!imageUrl || !!authorName
  const isSubmitVisible = !editingId || hasChanges

  const showAuthorCancelButton = !!editingAuthorId || !!authFormName || !!authFormBio

  useEffect(() => {
      setAuthFormName('')
      setAuthFormBio('')
      setEditingAuthorId(null)
      setOriginalAuthor(null)
      setAuthorSearchQuery('')
  }, [activeTab])

  useEffect(() => {
    const initAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCurrentUserId(user.id)
            
            const metaName = user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.user_name
            if (metaName) {
                setCurrentUserName(metaName)
            }

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
    fetchCategories() 
    fetchPosts()
    fetchAuthors() 
  },[])

  const fetchCategories = async () => {
    const { data } = await supabase
        .from('categories')
        .select('id, title, slug')
    
    if (data) {
        const customOrder = ['статья', 'пост', 'перевод', 'фикшн']

        const sortedData = data.sort((a, b) => {
            const indexA = customOrder.indexOf(a.title.toLowerCase())
            const indexB = customOrder.indexOf(b.title.toLowerCase())
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            if (indexA !== -1) return -1
            if (indexB !== -1) return 1
            
            return a.title.localeCompare(b.title)
        })

        setDbCategories(sortedData)
        
        if (!editingId && sortedData.length > 0 && !category) {
             setCategory(sortedData[0].title)
             setCategoryId(sortedData[0].id)
        }
    }
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data as Post[])
    }
  }

  const fetchAuthors = async () => {
      const { data } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true }) 
      if (data) {
          setDbAuthors(data)
      }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const selectedTitle = e.target.value
     setCategory(selectedTitle)
     
     const foundCat = dbCategories.find(c => c.title === selectedTitle)
     if (foundCat) {
         setCategoryId(foundCat.id)
     } else {
         setCategoryId(null)
     }
  }

  const filteredPosts = useMemo(() => {
      return posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = activeFilter === 'all' || 
            (post.category && post.category.toLowerCase() === activeFilter.toLowerCase())

        return matchesSearch && matchesCategory
      })
    },[posts, searchQuery, activeFilter])

  const filteredAuthors = useMemo(() => {
      return dbAuthors.filter(author => 
          author.name.toLowerCase().includes(authorSearchQuery.toLowerCase())
      )
  },[dbAuthors, authorSearchQuery])

  const canManagePost = (post: Post) => {
      if (!currentUserId) return false
      if (isAdmin) return true 
      if (post.user_id === currentUserId) return true
      if (currentUserName && post.author === currentUserName) return true
      return false
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('media').getPublicUrl(filePath)

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
    if (activeTab !== 'posts') return
    
    const target = e.target as HTMLElement;
    if (target.closest('.ProseMirror') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

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
    setSlug(post.slug || '')
    setExcerpt(post.excerpt || '')
    setContent(post.content || '')
    setImageUrl(post.image_url || '')
    setAuthorName(post.author || '') 
    setTranslatorName(post.translator || '')
    
    setCategory(post.category || (dbCategories[0]?.title || ''))
    setCategoryId(post.category_id || null)

    setIsFeatured(post.is_featured || false)
    setEditingId(post.id)
    setOriginalPost(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setImageUrl('')
    setAuthorName('')
    setTranslatorName('')
    if (dbCategories.length > 0) {
        setCategory(dbCategories[0].title)
        setCategoryId(dbCategories[0].id)
    } else {
        setCategory('')
        setCategoryId(null)
    }
    setIsFeatured(false)
    setEditingId(null)
    setOriginalPost(null)
  }

  const handleCancelEdit = () => {
    let shouldConfirm = false;
    if (editingId && originalPost) {
        shouldConfirm = hasChanges;
    } else {
        shouldConfirm = !!title || !!excerpt || !!normalizeContent(content) || !!imageUrl || !!authorName;
    }
    if (shouldConfirm) {
        if (!window.confirm('Отменить изменения?')) {
            return;
        }
    }
    resetForm();
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content || !currentUserId) return
    setLoading(true)

    const finalSlug = slug.trim() || generateSlug(title);

    const payload = { 
      title, 
      slug: finalSlug,
      excerpt: excerpt.trim() === '' ? null : excerpt,
      content: normalizeContent(content),
      image_url: imageUrl.trim() === '' ? null : imageUrl,
      author: authorName.trim() === '' ? null : authorName,
      translator: translatorName.trim() === '' ? null : translatorName,
      category, 
      category_id: categoryId, 
      is_featured: isFeatured
    }

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('posts').update(payload).eq('id', editingId)
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('posts').insert([{ ...payload, user_id: currentUserId }])
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
      if (editingId === post.id) resetForm()
      setPosts(posts.filter((p) => p.id !== post.id))
    }
  }

  const handleToggleFeatured = async (post: Post) => {
    const newValue = !post.is_featured
    const { error } = await supabase
      .from('posts')
      .update({ is_featured: newValue })
      .eq('id', post.id)
    if (!error) {
      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, is_featured: newValue } : p
      ))
    }
  }

  const handleSaveAuthor = async () => {
      if (!authFormName) return alert('Имя обязательно')
      setLoading(true)
      
      const payload = { name: authFormName, bio: authFormBio }
      let error;

      if (editingAuthorId) {
          const { error: err } = await supabase.from('authors').update(payload).eq('id', editingAuthorId)
          error = err
      } else {
          const { error: err } = await supabase.from('authors').insert([payload])
          error = err
      }
      
      if (error) {
          alert('Ошибка: ' + error.message)
      } else {
          setAuthFormName('')
          setAuthFormBio('')
          setEditingAuthorId(null)
          setOriginalAuthor(null)
          fetchAuthors()
      }
      setLoading(false)
  }

  const handleCancelAuthor = () => {
      if (hasAuthorChanges) {
          if (!window.confirm('Отменить изменения?')) return
      }
      setAuthFormName('')
      setAuthFormBio('')
      setEditingAuthorId(null)
      setOriginalAuthor(null)
  }

  const handleEditAuthorClick = (a: Author) => {
      setAuthFormName(a.name)
      setAuthFormBio(a.bio || '')
      setEditingAuthorId(a.id)
      setOriginalAuthor({ name: a.name, bio: a.bio || '' })
  }

  const handleDeleteAuthor = async (id: number) => {
      if(!confirm('Удалить автора из базы?')) return
      await supabase.from('authors').delete().eq('id', id)
      fetchAuthors()
  }

  return (
    <div className="admin-force-dark min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-white selection:text-black" onPaste={handlePaste}>
      
      <nav className="border-b border-neutral-800 px-4 md:px-6 py-4 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-4 md:gap-10 pl-0 md:pl-5">
              
              <div className="flex items-center gap-2 md:gap-4 text-sm font-mono text-neutral-400 whitespace-nowrap">
                <Link 
                    href="/" 
                    prefetch={true}
                    className="hover:text-white transition-colors uppercase tracking-widest"
                >
                    [ SITE ]
                </Link>
                {!isCheckingAuth && (
                    <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-widest select-none ${isAdmin ? 'border-purple-900 text-purple-400' : 'border-blue-900 text-blue-400'}`}>
                        {isAdmin ? 'ROOT' : 'AUTHOR'}
                    </span>
                )}
              </div>
              
              <div className="hidden md:flex gap-2 text-xs md:text-sm font-mono">
                  <button 
                      onClick={() => setActiveTab('posts')}
                      className={`px-2 md:px-4 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${activeTab === 'posts' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                      RECORDS
                  </button>
                  <button 
                      onClick={() => setActiveTab('authors')}
                      className={`px-2 md:px-4 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${activeTab === 'authors' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                      SUBJECTS
                  </button>
              </div>
          </div>

          <div className="flex gap-6 text-sm font-mono pr-0 md:pr-5 whitespace-nowrap">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-red-900 hover:text-red-500 uppercase tracking-widest transition-colors">
              [ LOG OUT ]
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'posts' && (
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
                <img src={getImageUrl(imageUrl)} alt="Preview" className="h-48 mx-auto object-cover" />
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                <div className="md:col-span-5 space-y-4">
                    <AuthorAutocomplete 
                        value={authorName}
                        onChange={setAuthorName}
                        placeholder="Имя автора"
                        suggestions={dbAuthors}
                    />
                    {category.toLowerCase() === 'перевод' && (
                        <AuthorAutocomplete 
                            value={translatorName}
                            onChange={setTranslatorName}
                            placeholder="Переводчик"
                            suggestions={dbAuthors}
                        />
                    )}
                </div>

                <div className="md:col-span-4">
                    <select
                        value={category}
                        onChange={handleCategoryChange}
                        className="w-full bg-[#0a0a0a] border-b border-neutral-800 text-sm text-neutral-200 p-3 font-mono focus:outline-none focus:border-white transition-colors appearance-none uppercase rounded-none"
                    >
                        {dbCategories.length > 0 ? (
                            dbCategories.map(cat => (
                                <option key={cat.id} value={cat.title}>
                                    {cat.title.toUpperCase()} 
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="статья">СТАТЬЯ</option>
                                <option value="перевод">ПЕРЕВОД</option>
                                <option value="фикшн">ФИКШН</option>
                                <option value="пост">ПОСТ</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="md:col-span-3 flex justify-end pt-3">
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
                    className="w-full bg-transparent resize-none border-none outline-none text-xl md:text-2xl font-serif italic text-neutral-400 placeholder:text-neutral-800 leading-relaxed mt-2"
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

        <div className="lg:col-span-1 border-l border-neutral-900 pl-8 hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden custom-scrollbar">
          
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
                {dbCategories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveFilter(cat.title)} 
                        className={`px-2 py-1 border transition-colors ${activeFilter === cat.title ? 'border-white text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                    >
                        {cat.title.toUpperCase()}
                    </button>
                ))}
             </div>
          </div>

          <h2 className="text-[10px] font-mono text-neutral-500 mb-6 tracking-[0.2em] uppercase">
             INDEX ({filteredPosts.length})
          </h2>

          <div className="space-y-2 pb-20">
            {filteredPosts.map((post) => {
              const allowed = canManagePost(post);
              return (
                <div 
                  key={post.id} 
                  className={`
                    group p-3 border-b transition-all relative
                    ${editingId === post.id 
                        ? 'opacity-100 border-white bg-neutral-900/30 -mx-2 px-5' 
                        : allowed 
                            ? 'opacity-60 hover:opacity-100 border-neutral-900 cursor-pointer hover:bg-neutral-900/10' 
                            : 'opacity-30 border-neutral-900 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                     <div onClick={() => allowed && handleEditClick(post)} className="w-full pr-16">
                        <div className="flex items-center gap-2 mb-2">
                            {!allowed && <span className="text-[9px] text-red-900 border border-red-900/50 px-1 font-mono uppercase">LOCKED</span>}
                            <h3 className={`text-base font-serif font-bold uppercase leading-tight transition-colors ${allowed ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-500'}`}>
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
                         <div className={`absolute top-3 flex items-center gap-3 transition-all ${editingId === post.id ? 'right-5' : 'right-3'}`}>
                             <button
                               onClick={(e) => { e.stopPropagation(); handleToggleFeatured(post) }}
                               className="transition-colors"
                               title="В слайдер"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-4 h-4 transition-colors ${post.is_featured ? 'text-white' : 'text-neutral-700 hover:text-neutral-400'}`} fill={post.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                               </svg>
                             </button>
                             <button onClick={() => handleDelete(post)} className="transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-neutral-700 hover:text-red-700">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                             </button>
                         </div>
                     )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      )}

      {activeTab === 'authors' && (
      <main className="max-w-[1400px] mx-auto px-6 py-12 pb-32 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
              <div className="border border-neutral-800 bg-neutral-900/20 rounded-sm">
                  <div className="p-5">
                      <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-6">
                          {editingAuthorId ? 'EDITING PERSON' : 'ADD NEW SUBJECT'}
                      </h2>
                      
                      <div className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                               <div className="md:col-span-5">
                                   <input 
                                      type="text" 
                                      placeholder="Имя автора" 
                                      className="w-full bg-transparent border-b border-neutral-800 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-white focus:outline-none transition-colors font-mono"
                                      value={authFormName}
                                      onChange={e => setAuthFormName(e.target.value)}
                                   />
                               </div>
                           </div>
                      </div>
                  </div>
                  
                  <TextareaAutosize
                    placeholder="Описание..."
                    className="w-full bg-transparent resize-none border-t border-neutral-800 p-5 text-xl font-serif text-neutral-300 placeholder:text-neutral-700 focus:outline-none min-h-[380px] leading-relaxed"
                    value={authFormBio}
                    onChange={e => setAuthFormBio(e.target.value)}
                  />
              </div>
          </div>

          <div className="lg:col-span-1 border-l border-neutral-900 pl-8 hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden custom-scrollbar">
              
              <div className="mb-8 space-y-4">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="ПОИСК..." 
                        value={authorSearchQuery}
                        onChange={(e) => setAuthorSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-b border-neutral-800 pb-2 text-xs font-mono uppercase tracking-widest text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-colors"
                    />
                 </div>
              </div>

              <h2 className="text-[10px] font-mono text-neutral-500 mb-2 tracking-[0.2em] uppercase">
                  PEOPLE INDEX ({filteredAuthors.length})
              </h2>
              <div className="pb-20">
                  {filteredAuthors.map(author => (
                      <div 
                        key={author.id} 
                        onClick={() => handleEditAuthorClick(author)}
                        className={`
                            group py-3 border-b transition-all relative cursor-pointer select-none
                            ${editingAuthorId === author.id 
                                ? 'opacity-100 border-white bg-neutral-900/30 -mx-2 px-2' 
                                : 'opacity-60 hover:opacity-100 border-neutral-900 hover:bg-neutral-900/10 px-0 hover:px-2'
                            }
                        `}
                      >
                          <div className="flex justify-between items-start">
                              <div className="w-full pr-16">
                                  <div className="flex items-center gap-2 mb-2">
                                      <h3 className={`font-mono text-xs uppercase transition-colors ${editingAuthorId === author.id ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                                          {author.name}
                                      </h3>
                                  </div>
                              </div>
                              
                              <div className={`absolute top-3 flex items-center gap-3 transition-all ${editingAuthorId === author.id ? 'right-5' : 'right-3'}`}>
                                  <button 
                                     onClick={(e) => { 
                                         e.stopPropagation(); 
                                         handleDeleteAuthor(author.id);
                                     }} 
                                     className="transition-colors"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-neutral-700 hover:text-red-700">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </main>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-neutral-900 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex justify-end gap-6 items-center">
                
                {activeTab === 'posts' ? (
                    <>
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
                            disabled={loading || !title || !isSubmitVisible}
                            className={`
                                px-10 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest 
                                hover:bg-neutral-200 disabled:opacity-50 transition-all
                                ${isSubmitVisible ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}
                            `}
                        >
                            {loading ? 'СОХРАНЕНИЕ...' : editingId ? 'ОБНОВИТЬ' : 'ОПУБЛИКОВАТЬ'}
                        </button>
                    </>
                ) : (
                    <>
                        {showAuthorCancelButton && (
                           <button 
                              onClick={handleCancelAuthor} 
                              className="px-6 py-3 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest transition-colors"
                           >
                              ОТМЕНА
                           </button>
                        )}

                        <button 
                            onClick={handleSaveAuthor}
                            disabled={loading || !authFormName}
                            className={`
                                px-10 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest 
                                hover:bg-neutral-200 disabled:opacity-50 transition-all
                            `}
                        >
                            {editingAuthorId ? 'СОХРАНИТЬ' : 'ДОБАВИТЬ'}
                        </button>
                    </>
                )}
                
            </div>
        </div>
      </div>
    </div>
  )
}
