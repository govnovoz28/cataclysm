
'use server'

import { createClient } from '../utils/supabase/server'; 
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function incrementView(postId: string) {
  const cookieStore = await cookies();

  const supabase = await createClient(cookieStore);
  const { error } = await supabase.rpc('increment_view_count', { post_id: postId });

  if (error) {
    console.error('Error incrementing view:', error);
    return;
  }

  revalidatePath('/');
  revalidatePath(`/post/${postId}`);
}
