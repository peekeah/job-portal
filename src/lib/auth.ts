import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/db";
import user from "@/models/user";
import { comparePassword } from "@/utils/bcrypt";
import { AuthOptions } from "next-auth";

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
        await connectToDatabase();
        const existUser = await user.findOne({ email: credentials?.email });

        if (!existUser) throw new Error("No user found with this email");
        const isPasswordValid = await comparePassword(credentials!.password, existUser!.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: existUser._id.toString(),
          email: existUser.email,
          user_type: existUser.userType || "user",
        };
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
} satisfies AuthOptions
