import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ADMINS = [
  'svatoslav.kopaev046@gmail.com',
  'kirill20042811@gmail.com',
  'rustamtishkov@gmail.com',
  'mk11dava@gmail.com'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. БЫСТРЫЙ ВЫХОД: Если это не админка и не логин — выходим мгновенно.
  // Никаких запросов к Supabase, никакой задержки.
  if (!pathname.startsWith('/admin') && pathname !== '/login') {
    return NextResponse.next()
  }

  // 2. Инициализация только если это действительно нужно
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!ALLOWED_ADMINS.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname === '/login') {
    if (user && ALLOWED_ADMINS.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

// 3. Строгий matcher. 
// Не нужно проверять всё подряд.
export const config = {
  matcher: ['/admin/:path*', '/login'],
}