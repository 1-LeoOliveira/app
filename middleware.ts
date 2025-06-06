// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isLoginPath = path === '/admin/login'

  // Se for uma rota admin e não for a rota de login
  if (isAdminPath && !isLoginPath) {
    // Verifica o cookie de autenticação
    const adminAutenticado = request.cookies.get('adminAutenticado')?.value === 'true'

    if (!adminAutenticado) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}