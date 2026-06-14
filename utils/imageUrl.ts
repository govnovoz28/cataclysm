const SUPABASE_ORIGIN = 'https://kksblfpjhrkbuuvsbvcf.supabase.co';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.replace(SUPABASE_ORIGIN, '');
}