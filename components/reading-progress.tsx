'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight
      
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        )
      }
    }

    window.addEventListener('scroll', updateScrollCompletion)
    return () => {
      window.removeEventListener('scroll', updateScrollCompletion)
    }
  }, [])

  return (
    <div 
      className="absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-100 ease-out"
      style={{ width: `${completion}%` }}
    />
  )
}
