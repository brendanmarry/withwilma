import { NextResponse } from "next/server";

const APP_ORIGIN =
  process.env.CORS_ALLOWED_ORIGIN ??
  process.env.FRONTEND_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3001";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const withCors = <T extends NextResponse>(response: T): T => {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

export const corsHeaders = CORS_HEADERS;

export const corsOptionsResponse = () => withCors(new NextResponse(null, { status: 204 }));

