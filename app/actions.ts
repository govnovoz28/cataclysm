// app/actions.ts
'use server'

// 👇 ИЗМЕНЕНИЕ: используем относительный путь (две точки в начале)
import { createClient } from '../utils/supabase/server'; 
import { cookies } from 'next/headers';

export async function incrementView(postId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Вызов RPC функции базы данных
  const { error } = await supabase.rpc('increment_view_count', { post_id: postId });

  if (error) {
    console.error('Error incrementing view:', error);
  }
}