import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const origin = request.headers.get("origin") || "";

    // Define allowed origins
    // We want to allow localhost:3000 and any subdomain of localhost:3000
    // e.g. http://babus-z4k9.localhost:3000
    const isAllowedOrigin =
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".withwilma.com") ||
        !origin; // Allow server-side fetch where origin might be missing

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        const preflightHeaders = {
            "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "http://localhost:3000",
            "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
            "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-tenant-id",
            "Access-Control-Allow-Credentials": "true",
        };
        return NextResponse.json({}, { headers: preflightHeaders });
    }

    // Handle simple requests
    const response = NextResponse.next();

    if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-tenant-id");
    }

    return response;
}

export const config = {
    matcher: "/api/:path*",
};
