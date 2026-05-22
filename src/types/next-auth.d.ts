import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      user_type: string;
      provider: string;
      needsOnboarding: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    user_type: string;
    provider: string;
    needsOnboarding: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string;
    name?: string | null;
    user_type: string;
    provider: string;
    needsOnboarding: boolean;
  }
}
