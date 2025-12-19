// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// !!! ВАЖНО: Впиши сюда реальные email-ы администраторов !!!
const ALLOWED_EMAILS = [
  'svatoslav.kopaev046@gmail.com',
  'author@cataclysm.com',
  'editor@cataclysm.com'
]

export async function updateSession(request: NextRequest) {
  // 1. Создаем ответ
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Инициализируем Supabase клиент для сервера
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Получаем пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // --- ЛОГИКА ЗАЩИТЫ ---

  // А) Защита админки (/admin)
  if (path.startsWith('/admin')) {
    // Если нет пользователя -> на логин
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Если email не в белом списке -> на главную
    if (!ALLOWED_EMAILS.includes(user.email || '')) {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Или на страницу ошибки
      return NextResponse.redirect(url)
    }
  }

  // Б) Если админ уже залогинен и идет на /login -> кидаем сразу в админку
  if (path.startsWith('/login')) {
    if (user && ALLOWED_EMAILS.includes(user.email || '')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return response
}