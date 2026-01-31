import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host");
    const url = request.nextUrl;

    // Skip if no hostname (shouldn't happen in browser)
    if (!hostname) return NextResponse.next();

    // Define domains that are NOT tenants
    const reservedSubdomains = ["www", "app", "api", "minio", "admin"];

    // For localhost, the format is usually sub.localhost:3000
    // For production, it might be sub.withwilma.com

    const isLocalhost = hostname.includes("localhost");
    const domainParts = hostname.split(".");

    let subdomain = "";

    if (isLocalhost) {
        // localhost:3000 -> ["localhost:3000"] (no subdomain)
        // sub.localhost:3000 -> ["sub", "localhost:3000"]
        if (domainParts.length > 1) {
            subdomain = domainParts[0];
        }
    } else {
        // sub.withwilma.com -> ["sub", "withwilma", "com"]
        if (domainParts.length > 2) {
            subdomain = domainParts[0];
        }
    }

    // If we have a subdomain and it's not reserved, treat it as a tenant
    if (subdomain && !reservedSubdomains.includes(subdomain)) {
        // Strict Tenant Isolation: Block access to /employer routes on tenant subdomains
        if (url.pathname.startsWith("/employer")) {
            return NextResponse.rewrite(new URL("/404", request.url));
        }

        // Clone headers to add x-tenant-id
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-tenant-id", subdomain);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
