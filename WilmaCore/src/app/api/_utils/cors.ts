import { NextResponse } from "next/server";

const APP_ORIGIN =
  process.env.CORS_ALLOWED_ORIGIN ??
  process.env.FRONTEND_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const withCors = <T extends NextResponse>(response: T, req?: Request): T => {
  // If we have a request, we can check the origin dynamically
  if (req) {
    const origin = req.headers.get("origin");
    if (origin && (
      origin.endsWith(".withwilma.com") ||
      origin === "https://withwilma.com" ||
      origin.includes("localhost") ||
      origin === process.env.NEXT_PUBLIC_APP_URL
    )) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      // Fallback to configured app origin
      response.headers.set("Access-Control-Allow-Origin", APP_ORIGIN);
    }
  } else {
    // Legacy behavior or when req is missing
    response.headers.set("Access-Control-Allow-Origin", APP_ORIGIN);
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
};

export const corsOptionsResponse = (req?: Request) => {
  return withCors(new NextResponse(null, { status: 204 }), req);
};

