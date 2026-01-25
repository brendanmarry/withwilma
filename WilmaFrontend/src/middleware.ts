import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Define allowed domains that are NOT tenants
    const mainDomain = 'withwilma.com';
    const appDomain = 'app.withwilma.com';

    // Check if we are on a subdomain
    // This logic assumes we are running on localhost or *.withwilma.com
    // For localhost testing, we can simulate by checking if hostname starts with validation

    let currentTenant = '';

    // Simple subdomain extraction
    if (hostname.includes(mainDomain) && hostname !== mainDomain && hostname !== appDomain && hostname !== `www.${mainDomain}`) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
            // e.g. babus.withwilma.com -> babus
            currentTenant = parts[0];
        }
    } else if (!hostname.includes('withwilma.com') && !hostname.includes('localhost')) {
        // Possible CNAME usage (e.g. babus.ch -> withwilma.com)
        // For now we might not be able to detect this easily without a mapping list
        // But if the user pointed babus.ch to our IP, the host header would be babus.ch
        // So we can use that as the tenant ID potentially, or look it up.
        // For this implementation, we will assume the host IS the tenant identifier for custom domains
        currentTenant = hostname.split('.')[0]; // simplistic check
    } else if (hostname.includes('localhost')) {
        // Localhost handling: e.g. babus.localhost:3000
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            currentTenant = parts[0];
        }
    }

    // Clone the request headers
    const requestHeaders = new Headers(request.headers);

    // If a tenant is detected, set it in the headers for the server component to read
    if (currentTenant && currentTenant !== 'app' && currentTenant !== 'www') {
        requestHeaders.set('x-tenant-id', currentTenant);
    }

    // Allow the request to proceed
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
