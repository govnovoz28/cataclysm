'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const supabase = createClient()

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `editor/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка при загрузке изображения в редактор')
      return null
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Напишите философскую мысль...',
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'prose prose-invert prose-p:text-xl max-w-none font-serif text-neutral-300 focus:outline-none min-h-[50vh] p-4 prose-headings:font-bold prose-headings:text-white prose-blockquote:border-l-2 prose-blockquote:border-white prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[#e5e5e5] placeholder:text-neutral-700 [&_blockquote_p]:text-left [&_blockquote_p:last-of-type]:text-right [&_blockquote_p:last-of-type]:mt-4 [&_blockquote_p:last-of-type]:text-[#e5e5e5] [&_img]:rounded-none [&_img]:border-none [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:w-auto [&_img]:mx-auto [&_img]:opacity-90 hover:[&_img]:opacity-100 [&_img]:transition-opacity',
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault()
            event.stopPropagation()
            
            const file = item.getAsFile()

            if (file) {
              uploadImage(file).then((url) => {
                if (url) {
                  const { schema } = view.state
                  const node = schema.nodes.image.create({ src: url })
                  const transaction = view.state.tr.replaceSelectionWith(node)
                  view.dispatch(transaction)
                }
              })
            }
            return true
          }
        }
        return false
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            event.stopPropagation()

            uploadImage(file).then((url) => {
              if (url) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                   const node = schema.nodes.image.create({ src: url })
                   const transaction = view.state.tr.insert(coordinates.pos, node)
                   view.dispatch(transaction)
                }
              }
            })
            return true
          }
        }
        return false
      }
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== undefined) {
      if (editor.getHTML() !== content && !editor.isFocused) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const btnBase = "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors border rounded-sm"
  const activeStyle = "bg-white text-black border-white"
  const inactiveStyle = "bg-transparent text-neutral-500 border-transparent hover:text-white hover:border-neutral-800"

  return (
    <div className="border border-neutral-800 bg-neutral-900/10 backdrop-blur-sm group transition-colors hover:border-neutral-700 rounded-none overflow-hidden">
      
      <div className="flex gap-2 p-2 border-b border-neutral-800 bg-neutral-900/30 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Ctrl+B"
          className={`${btnBase} ${editor.isActive('bold') ? activeStyle : inactiveStyle}`}
        >
          BOLD
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Ctrl+I"
          className={`${btnBase} ${editor.isActive('italic') ? activeStyle : inactiveStyle}`}
        >
          ITALIC
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Ctrl+Shift+B"
          className={`${btnBase} ${editor.isActive('blockquote') ? activeStyle : inactiveStyle}`}
        >
          QUOTE
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
