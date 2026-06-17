import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { AuthOptions } from 'next-auth';
import { cookies } from 'next/headers';

import { prisma } from './db';
import { comparePassword } from '@/lib/bcrypt';
import { getEnv } from './config';
import { UserType } from '@prisma/client';
import { AUTH_INTENT_COOKIE, AUTH_TYPE_COOKIE } from './auth-utils';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const existUser = await prisma.auth.findUnique({
            where: { email: credentials.email },
          });

          if (!existUser) {
            throw new Error('user does not exist');
          }

          if (existUser.provider !== 'credentials') {
            throw new Error('Please login with Google');
          }

          const isPasswordValid = await comparePassword(
            credentials.password,
            existUser.password!,
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: existUser.id,
            email: existUser.email,
            user_type: existUser.user_type || UserType.applicant,
            provider: 'credentials',
            needsOnboarding: !existUser.user_id,
          };
        } catch (err) {
          let res = 'Error while login';
          if (err instanceof Error) {
            res = err.message;
          }
          throw new Error(res);
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login', // optional: custom login page
    error: '/login',
  },
  secret: getEnv('NEXTAUTH_SECRET'),
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existUser = await prisma.auth.findUnique({
          where: { email: user.email! },
        });

        if (existUser && existUser.provider !== 'google') {
          throw new Error('OAuthAccountExists');
        }

        if (!existUser) {
          const cookieStore = await cookies();
          const intent = cookieStore.get(AUTH_INTENT_COOKIE)?.value;

          if (intent === 'login') {
            throw new Error('UserNotFound');
          }

          const userType =
            (cookieStore.get(AUTH_TYPE_COOKIE)?.value as UserType) ||
            UserType.applicant;

          const newUser = await prisma.auth.create({
            data: {
              email: user.email!,
              provider: 'google',
              providerAccountId: account.providerAccountId,
              user_type: userType,
            },
          });
          user.id = newUser.id;
          user.email = newUser.email;
          user.user_type = newUser.user_type;
          user.provider = 'google';
          user.needsOnboarding = true;
        } else {
          // Existing Google User
          user.id = existUser.id;
          user.email = existUser.email;
          user.user_type = existUser.user_type;
          user.provider = 'google';
          user.needsOnboarding = !existUser.user_id;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.user_type = user.user_type;
        token.provider = user.provider;
        token.needsOnboarding = user.needsOnboarding;
      }

      if (trigger === 'update') {
        const updatedUser = await prisma.auth.findUnique({
          where: { id: token.id },
        });

        if (updatedUser) {
          token.email = updatedUser.email;
          token.user_type = updatedUser.user_type;
          token.needsOnboarding = !updatedUser.user_id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.user_type = token.user_type;
        session.user.provider = token.provider;
        session.user.needsOnboarding = token.needsOnboarding;
      }
      return session;
    },
  },
} satisfies AuthOptions;
