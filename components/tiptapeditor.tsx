'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react' // <--- 1. Добавили импорт useEffect

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Напишите философскую мысль...',
      }),
    ],
    content: content, // Это срабатывает только при первой инициализации
    editorProps: {
      attributes: {
        spellcheck: 'false', 
        // Все классы в одну строку, чтобы не было ошибок
        class: 'prose prose-invert prose-lg max-w-none font-serif text-neutral-300 focus:outline-none min-h-[50vh] p-4 prose-headings:font-bold prose-headings:text-white prose-blockquote:border-l-2 prose-blockquote:border-white prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-400 placeholder:text-neutral-700 [&_blockquote_p:not(:first-of-type)]:text-right [&_blockquote_p:not(:first-of-type)]:mt-4 [&_blockquote_p:not(:first-of-type)]:text-neutral-500',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // --- 2. ДОБАВЛЕННЫЙ БЛОК ДЛЯ СИНХРОНИЗАЦИИ ---
  useEffect(() => {
    if (editor && content) {
      // Если контент, который пришел из базы, отличается от того, что сейчас в редакторе
      // (например, редактор пуст, а данные только что загрузились)
      if (editor.getHTML() !== content) {
        // Дополнительная проверка: обновляем только если редактор не в фокусе,
        // или если он почти пуст (чтобы курсор не скакал, если ты сам печатаешь)
        const isEditorEmpty = editor.getText().trim() === '' && editor.getHTML() === '<p></p>';
        
        if (isEditorEmpty || !editor.isFocused) {
            editor.commands.setContent(content)
        }
      }
    }
  }, [content, editor])
  // ---------------------------------------------

  if (!editor) {
    return null
  }

  const btnBase = "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors border"
  const activeStyle = "bg-white text-black border-white"
  const inactiveStyle = "bg-transparent text-neutral-500 border-transparent hover:text-white hover:border-neutral-800"

  return (
    <div className="border border-neutral-800 bg-neutral-900/10 backdrop-blur-sm group transition-colors hover:border-neutral-700">
      
      {/* Панель инструментов */}
      <div className="flex gap-2 p-2 border-b border-neutral-800 bg-neutral-900/30">
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