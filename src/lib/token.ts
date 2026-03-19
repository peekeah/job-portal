import { NextRequest } from "next/server";
import { getToken as fetchToken } from "next-auth/jwt";
import { getEnv } from "./config";

export function getToken(req: NextRequest) {
  return fetchToken({ req, secret: getEnv("NEXTAUTH_SECRET") });
}
