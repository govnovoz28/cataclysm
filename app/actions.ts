// ==========================================
// app\actions.ts
// ==========================================
'use server'

import { createClient } from '../utils/supabase/server'; 
import { cookies } from 'next/headers'; 

export async function incrementView(postId: string) {
  try {
    if (!/^\d+$/.test(postId)) {
      console.error('[Action Error] postId не является валидным числом:', postId);
      return { success: false, reason: 'invalid_id' };
    }
    
    const idAsNumber = parseInt(postId, 10);
    const cookieStore = await cookies(); 
    const cookieName = `viewed_post_${idAsNumber}`;

    const hasViewed = cookieStore.get(cookieName);
    if (hasViewed) {
      return { success: false, reason: 'already_viewed' }; 
    }

    // Инициализация Supabase (createClient синхронна, await не нужен)
    const supabase = createClient(cookieStore); 
    
    const { error } = await supabase.rpc('increment_view_count', { 
      post_id: idAsNumber 
    });

    if (error) {
      console.error('[Action Error] Ошибка RPC:', error);
      return { success: false, reason: 'db_error' };
    }

    cookieStore.set(cookieName, 'true', {
      maxAge: 60 * 60 * 24, 
      httpOnly: true,       
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    return { success: true };
    
  } catch (err) {
    console.error('[Action Critical Error]:', err);
    return { success: false, reason: 'critical_error' };
  }
}