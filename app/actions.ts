'use server'

import { createClient } from '../utils/supabase/server'; 
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function incrementView(postId: string) {
  try {
    const cookieStore = await cookies();

    const supabase = createClient(cookieStore); 

    console.log(`[Action] Пытаюсь обновить просмотры для ID: ${postId}`);

    const { error } = await supabase.rpc('increment_view_count', { 
      post_id: postId 
    });

    if (error) {
      console.error('[Action Error] Ошибка RPC:', error);
      return;
    }

    console.log('[Action] Успех! Обновляю кэш.');
    
    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    
  } catch (err) {
    console.error('[Action Critical Error] Что-то совсем сломалось:', err);
  }
}
