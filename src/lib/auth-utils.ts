import { UserType } from '@prisma/client';

export const AUTH_INTENT_COOKIE = 'auth_intent';
export const AUTH_TYPE_COOKIE = 'auth_type';

export type AuthIntent = 'login' | 'signup';

export const setAuthCookies = (intent: AuthIntent, type?: UserType) => {
  if (typeof document === 'undefined') return;
  
  const maxAge = 300; // 5 minutes
  document.cookie = `${AUTH_INTENT_COOKIE}=${intent}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (type) {
    document.cookie = `${AUTH_TYPE_COOKIE}=${type}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_INTENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${AUTH_TYPE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};
