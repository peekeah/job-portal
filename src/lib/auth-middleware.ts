import { NextRequest } from 'next/server';
import { getToken } from './token';
import { CustomError } from './errors';

export type Role = 'company' | 'applicant' | 'admin';

export async function authMiddleware(req: NextRequest, role?: Role) {
  const token = await getToken(req);
  if (!token) {
    throw new CustomError('unauthorized', 401);
  }

  if (!token.email) {
    throw new CustomError('Token missing email', 401);
  }

  if (role && token.user_type !== role) {
    throw new CustomError('you are not authorized', 401);
  }

  return token;
}
