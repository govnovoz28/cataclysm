'use client'

import { useRouter } from 'next/navigation'

export default function AuthorLink({ name }: { name: string }) {
  const router = useRouter()

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/author/${name}`)
      }}
      className="block bg-black border-r border-b border-neutral-800 px-3 py-1 hover:bg-white group/author transition-colors cursor-pointer w-fit"
    >
      <span className="font-mono text-[12px] font-bold text-white uppercase tracking-widest group-hover/author:text-black">
        {name}
      </span>
    </button>
  )
}