import { NextRequest, NextResponse } from 'next/server';
import { getToken } from './lib/token';
import { authAj } from './lib/arcjet';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Rate limit NextAuth routes (which we don't control directly)
  if (
    process.env.NODE_ENV === 'production' &&
    authAj &&
    (path.startsWith('/api/auth/callback/credentials') ||
      path.startsWith('/api/auth/signin/credentials'))
  ) {
    const decision = await authAj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { status: false, message: 'Too many requests. Please try again later.' },
          { status: 429 },
        );
      } else if (decision.reason.isBot()) {
        return NextResponse.json(
          { status: false, message: 'Bot detected' },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { status: false, message: 'Forbidden' },
        { status: 403 },
      );
    }
  }

  const params = req.nextUrl.searchParams;
  const token = await getToken(req);

  const isProtectedRoute = path.startsWith('/dashboard');
  const isOnboardRoute = path.startsWith('/onboard');

  const isPublicRoute =
    path === '/' || path.startsWith('/login') || path.startsWith('/signup');

  if (token && token.needsOnboarding && !isOnboardRoute) {
    return NextResponse.redirect(new URL('/onboard', req.url));
  }

  if (token && !token.needsOnboarding && isOnboardRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/reset-password')) {
    const token = params.get('token');
    if (!token) {
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
    '/api/auth/:path*',
  ],
};
