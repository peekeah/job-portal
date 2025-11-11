import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import { prisma } from "./db";
import { comparePassword } from "@/lib/bcrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      user_type: string;
    }
  }

  interface User {
    id: string;
    email: string;
    user_type: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    user_type: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const existUser = await prisma.auth.findUnique({ where: { email: credentials?.email } });

          if (!existUser) {
            throw new Error("user does not exist")
          }

          const isPasswordValid = await comparePassword(credentials!.password, existUser!.password);
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: existUser.id,
            email: existUser.email,
            user_type: existUser.user_type || "user",
          };
        } catch (err) {
          console.log("err:", err)
          let res = "Error while login";
          if (err instanceof Error) {
            res = err.message;
          }
          throw new Error(res)
        }
      }
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/login", // optional: custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.user_type = user.user_type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.user_type = token.user_type;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
} satisfies AuthOptions
