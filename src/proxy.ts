import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('wecolax_session')?.value;

  const isPublicPath = path === '/login' || path === '/api/auth/otp' || path === '/api/auth/login';

  // If trying to access a protected route without a session, redirect to login
  if (!isPublicPath && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login while already authenticated, redirect to dashboard
  if (path === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - we will protect them individually)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon-.*\\.png|sw\\.js|manifest\\.json|.*\\.svg).*)',
  ],
};
