'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { Mark, mergeAttributes, Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

const BigText = Mark.create({
  name: 'bigText',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'text-3xl font-bold uppercase tracking-tight leading-none decoration-clone block mt-24 mb-0',
      },
    }
  },

  parseHTML() {
    return[
      {
        tag: 'span',
        getAttrs: element => {
          if (typeof window === 'undefined') return false
          if (!(element instanceof HTMLElement)) return false
          return element.classList.contains('text-3xl') && null
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})

const ManualListPlugin = Extension.create({
  name: 'manualListPlugin',
  addProseMirrorPlugins() {
    return[
      new Plugin({
        key: new PluginKey('manualListPlugin'),
        state: {
          init() { return DecorationSet.empty },
          apply(tr, oldState) {
            const decorations: Decoration[] =[]
            tr.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph') {
                if (/^\s*\d+\)/.test(node.textContent)) {
                  decorations.push(Decoration.node(pos, pos + node.nodeSize, {
                    class: 'manual-list-item'
                  }))
                }
              }
            })
            return DecorationSet.create(tr.doc, decorations)
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          }
        }
      })
    ]
  }
})

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const supabase = createClient()
  
  const [_, forceUpdate] = useState(0);

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
    extensions:[
      StarterKit,
      BigText,
      ManualListPlugin,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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
        class: `
          prose prose-p:text-xl max-w-none font-serif text-theme-text 
          focus:outline-none min-h-[50vh] p-4 
          prose-headings:font-bold prose-headings:text-white 
          prose-blockquote:border-l-2 prose-blockquote:border-white prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-theme-text 
          placeholder:text-neutral-700 [&_blockquote_p]:text-left [&_blockquote_p+p:last-of-type]:text-right [&_blockquote_p+p:last-of-type]:mt-4[&_blockquote_p+p:last-of-type]:text-theme-text 
          
          [&_img]:rounded-none [&_img]:border-none [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:w-auto [&_img]:mx-auto [&_img]:opacity-90 hover:[&_img]:opacity-100 [&_img]:transition-opacity[&>*:first-child_.text-3xl]:!mt-0 [&>*:first-child]:!mt-0
        `.replace(/\s+/g, ' ').trim(),
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
    onTransaction: () => {
      forceUpdate(prev => prev + 1)
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

  const text = editor.getText().trim()
  const wordCount = text ? text.split(/\s+/).length : 0

  const btnBase = "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors border rounded-sm"
  const activeStyle = "bg-white text-black border-white"
  const inactiveStyle = "bg-transparent text-neutral-500 border-transparent hover:text-white hover:border-neutral-800"

  return (
    <div className="relative border border-neutral-800 bg-neutral-900/10 backdrop-blur-sm group transition-colors hover:border-neutral-700 rounded-none">
      
      <div className="sticky top-[61px] z-40 flex gap-2 p-2 border-b border-neutral-800 bg-theme-bg flex-wrap">
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
          onClick={() => editor.chain().focus().toggleMark('bigText').run()}
          disabled={!editor.can().toggleMark('bigText')}
          className={`${btnBase} ${editor.isActive('bigText') ? activeStyle : inactiveStyle}`}
        >
          TITLE
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${editor.isActive('orderedList') ? activeStyle : inactiveStyle}`}
        >
          NUM
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Ctrl+Shift+B"
          className={`${btnBase} ${editor.isActive('blockquote') ? activeStyle : inactiveStyle}`}
        >
          QUOTE
        </button>

        <button
          type="button"
          onClick={() => {
            if (editor.isActive({ textAlign: 'center' })) {
              editor.chain().focus().unsetTextAlign().run()
            } else {
              editor.chain().focus().setTextAlign('center').run()
            }
          }}
          className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? activeStyle : inactiveStyle}`}
        >
          CENTER
        </button>
      </div>

      <EditorContent editor={editor} />

      <div className="absolute bottom-3 right-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest select-none pointer-events-none">
        {wordCount} СЛОВ
      </div>
    </div>
  )
}

export default TiptapEditor
