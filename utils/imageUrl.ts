const SUPABASE_ORIGIN = 'https://kksblfpjhrkbuuvsbvcf.supabase.co';
const PROXY_ORIGIN = 'https://img.cataclysm.online';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.replace(SUPABASE_ORIGIN, PROXY_ORIGIN);
}