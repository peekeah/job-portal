import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/db";
import user from "@/models/user";
import { comparePassword } from "@/utils/bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("cdx:", credentials)
        await connectToDatabase();

        const existUser = await user.findOne({ email: credentials?.email });

        if (!existUser) throw new Error("No user found with this email");
        const isPasswordValid = await comparePassword(credentials!.password, existUser!.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: existUser._id.toString(),
          email: existUser.email,
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
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: any) {
      if (token) session.user.id = token.id as string;
      return session;
    },
  },
};

