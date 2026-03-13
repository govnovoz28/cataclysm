// components/author-sidebar.tsx
'use client'
import { useState } from 'react'

type AuthorData = {
    name: string
    bio: string | null
    image_url: string | null
}

const renderWithLinks = (text: string) => {
    const urlRegex = /((?:https?:\/\/|www\.|t\.me\/)[^\s]+)/g
    
    return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
            let href = part
            if (!href.startsWith('http')) {
                href = `https://${href}`
            }
            return (
                <a 
                    key={index} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-theme-title underline decoration-neutral-600 underline-offset-4 hover:decoration-theme-title transition-all"
                >
                    {part}
                </a>
            )
        }
        return part
    })
}

export default function AuthorSidebar({ author }: { author: AuthorData | null }) {
    const[isCollapsed, setIsCollapsed] = useState(false)

    if (!author || !author.bio) return null

    return (
        <div className="sticky top-24 border border-neutral-800 bg-theme-bg z-10">
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-900/10 transition-colors select-none border-b border-neutral-900/50 h-[50px]"
            >
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    INFO_BLOCK
                </span>
                <span className={`text-neutral-500 text-[10px] transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                    ▼
                </span>
            </div>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
                <div className="overflow-hidden">
                    <div className={`transition-opacity duration-500 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {author.image_url && (
                            <div className="relative w-full aspect-square border-b border-neutral-900">
                                <img 
                                    src={author.image_url} 
                                    alt={author.name} 
                                    className="w-full h-full object-cover grayscale contrast-125"
                                />
                            </div>
                        )}
                        
                        <div className="p-5">
                            <h1 className="font-serif text-xl uppercase font-bold text-theme-title mb-4 leading-none tracking-tight">
                                {author.name}
                            </h1>
                            <div className="font-serif text-theme-article text-base leading-relaxed whitespace-pre-wrap">
                                {renderWithLinks(author.bio)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}