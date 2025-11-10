import { NextRequest } from "next/server";
import { getToken as fetchToken } from "next-auth/jwt";
import { NextApiRequest } from "next";
import { CustomError } from "@/utils/errorHandler";

export function getToken(req: NextRequest | NextApiRequest) {
  return fetchToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export type Role = "company" | "applicant" | "admin";

export async function authMiddleware(req: NextRequest, role?: Role) {
  const token = await getToken(req)
  if (!token) {
    throw new CustomError("unauthorized", 401)
  }

  if (role && token.user_type !== role) {
    throw new CustomError("you are not authorized", 401)
  }

  return token

}
