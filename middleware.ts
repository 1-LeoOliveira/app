import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apenas para rotas admin que precisam de proteção
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    // Aqui você pode adicionar verificações adicionais se necessário
    // Por enquanto, apenas permitir todas as requisições
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*']
};