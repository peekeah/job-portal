import { NextRequest, NextResponse } from 'next/server';
import { getToken as fetchToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const params = req.nextUrl.searchParams;
  const token = await fetchToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isProtectedRoute = path.startsWith('/dashboard');
  const isOnboardRoute = path.startsWith('/onboard');

  const isPublicRoute =
    path === '/' || path.startsWith('/login') || path.startsWith('/signup');

  if (token && (token as any).needsOnboarding && !isOnboardRoute) {
    return NextResponse.redirect(new URL('/onboard', req.url));
  }

  if (token && !(token as any).needsOnboarding && isOnboardRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/reset-password')) {
    const resetToken = params.get('token');
    if (!resetToken) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/onboard',
  ],
};
