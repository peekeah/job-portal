import { NextRequest } from "next/server";
import { getToken as fetchToken } from "next-auth/jwt";

export function getToken(req: NextRequest) {
  return fetchToken({ req, secret: process.env.NEXTAUTH_SECRET });
}
