import { NextRequest } from "next/server";
import { getToken as fetchToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

export function getToken(req: NextRequest | NextApiRequest) {
  return fetchToken({ req, secret: process.env.NEXTAUTH_SECRET });
}
