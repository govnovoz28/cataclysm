const SUPABASE_ORIGIN = 'https://kksblfpjhrkbuuvsbvcf.supabase.co';
const CF_ORIGIN = 'https://img.cataclysm.online';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.replace(SUPABASE_ORIGIN, CF_ORIGIN);
}