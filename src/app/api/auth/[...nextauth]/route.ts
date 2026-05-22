import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { protectAuthRoute } from '@/lib/arcjet';

const handler = NextAuth(authOptions);

async function authHandler(req: NextRequest, context: any) {
  const path = req.nextUrl.pathname;

  // Protect sensitive auth routes with Arcjet
  if (
    path.startsWith('/api/auth/callback/credentials') ||
    path.startsWith('/api/auth/signin/credentials')
  ) {
    try {
      await protectAuthRoute(req);
    } catch (err: any) {
      return NextResponse.json(
        { status: false, message: err.message || 'Forbidden' },
        { status: err.status || 403 },
      );
    }
  }

  return handler(req, context);
}

export { authHandler as GET, authHandler as POST };
