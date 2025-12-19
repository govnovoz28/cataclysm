
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// но для фикса ошибки достаточно этого описания)
type CookieObject = {
  name: string
  value: string
  options?: any
}

const ALLOWED_EMAILS = [
  'svatoslav.kopaev046@gmail.com',
  'author@cataclysm.com',
  'editor@cataclysm.com'
]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieObject[]) {
          cookiesToSet.forEach(({ name, value }) =>
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (!ALLOWED_EMAILS.includes(user.email || '')) {
      const url = request.nextUrl.clone()
      url.pathname = '/' 
      return NextResponse.redirect(url)
    }
  }
  if (path.startsWith('/login')) {
    if (user && ALLOWED_EMAILS.includes(user.email || '')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return response
}