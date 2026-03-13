'use client'

import { useEffect, useState } from 'react';
import { incrementView } from '@/app/actions';

interface Props {
  postId: string;
  initialViews: number;
}

export default function ViewCounter({ postId, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const recordView = async () => {
      const storageKey = `viewed_post_time_${postId}`;
      const storedData = localStorage.getItem(storageKey);
      
      // Проверяем, есть ли отметка в браузере и не прошло ли 24 часа
      if (storedData) {
        const timestamp = parseInt(storedData, 10);
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        
        // Если 24 часа еще не прошли, вообще не дергаем сервер Vercel
        if (!isExpired) {
          return; 
        }
      }

      // Сразу ставим timestamp текущего времени ДО запроса (защита от React Strict Mode)
      localStorage.setItem(storageKey, Date.now().toString());
      
      // Отправляем запрос на сервер
      const result = await incrementView(postId);
      
      // Увеличиваем цифру в UI ТОЛЬКО если сервер подтвердил успешную запись
      if (result?.success) {
        setViews(prev => prev + 1); 
      }
    };

    recordView();
  }, [postId]);

  return (
    <span className="flex items-center gap-2 select-none" title="Просмотры">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-4 h-4 mb-[1px]"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      <span>{views}</span>
    </span>
  );
}
