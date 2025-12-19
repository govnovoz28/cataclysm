'use server'

import { createClient } from '../utils/supabase/server'; 
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function incrementView(postId: string) {
  try {
    const cookieStore = await cookies();
    // но если у тебя настроено с передачей cookieStore, оставь как есть.
    const supabase = createClient(cookieStore); 
    const idAsNumber = Number(postId);
    if (isNaN(idAsNumber)) {
        console.error('[Action Error] postId не является числом:', postId);
        return;
    }

    console.log(`[Action] Пытаюсь обновить просмотры для ID: ${idAsNumber}`);
    const { error } = await supabase.rpc('increment_view_count', { 
      post_id: idAsNumber 
    });

    if (error) {
      console.error('[Action Error] Ошибка RPC:', error);
      return;
    }

    console.log('[Action] Успех! Обновляю кэш.');
    revalidatePath(`/post/${postId}`);
    
  } catch (err) {
    console.error('[Action Critical Error] Что-то совсем сломалось:', err);
  }
}