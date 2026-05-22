import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";
import { NextRequest } from "next/server";
import { CustomError } from "./errors";

const ARCJET_KEY = process.env.ARCJET_KEY;
const isProd = process.env.NODE_ENV === "production";

// Initialize Arcjet only if key is present, otherwise create a mock-like interface
export const aj = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
      ],
    })
  : null;

export const authAj = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        fixedWindow({
          mode: "LIVE",
          characteristics: ["ip.src"],
          window: "15m",
          max: 5,
        }),
      ],
    })
  : null;

/**
 * Utility to protect a route with Arcjet's auth rules.
 * No-ops in development if ARCJET_KEY is missing or if not in production (if desired).
 */
export async function protectAuthRoute(req: NextRequest) {
  // Only run in production and if key is present
  if (!isProd || !authAj) {
    return;
  }

  const decision = await authAj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new CustomError("Too many requests. Please try again later.", 429);
    } else if (decision.reason.isBot()) {
      throw new CustomError("Bot detected.", 403);
    } else {
      throw new CustomError("Forbidden", 403);
    }
  }
}
