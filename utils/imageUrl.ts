const SUPABASE_ORIGIN = 'https://kksblfpjhrkbuuvsbvcf.supabase.co';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  // Отрезаем домен Supabase — запрос пойдет через ваш Render-сервер
  return url.replace(SUPABASE_ORIGIN, '');
}
