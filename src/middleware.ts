import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List the origins that are allowed to call the API.
// During development we include the Vite dev server; for production replace/add your real domain.
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite dev server (local testing)
  // 'https://mojavevalleyfinancial.com', // <-- uncomment/add when deploying
];

/**
 * Global Next.js middleware that adds the required CORS headers to every `/api/*`
 * endpoint. It also short‑circuits OPTIONS pre‑flight requests with a 200 response.
 */
export function middleware(request: NextRequest) {
  // Only apply to API routes – everything else (pages, assets) passes through unchanged.
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin') ?? '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // If this is a pre‑flight OPTIONS request, respond immediately.
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  // Run the middleware for all API routes.
  matcher: '/api/:path*',
};
