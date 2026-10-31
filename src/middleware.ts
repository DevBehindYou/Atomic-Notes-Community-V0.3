import { NextRequest, NextResponse } from 'next/server';

/**
 * Hosts the browser can have used to reach this deployment. `nextUrl.origin` is
 * not used: behind a proxy or on a custom hostname it can differ from the
 * origin the browser sends, which would reject the operator's own requests.
 */
function requestHosts(request: NextRequest): string[] {
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  return [request.headers.get('host'), forwarded]
    .filter((host): host is string => Boolean(host))
    .map((host) => host.toLowerCase());
}

function isSameSite(request: NextRequest, origin: string): boolean {
  try {
    return requestHosts(request).includes(new URL(origin).host.toLowerCase());
  } catch {
    return false; // "null" (sandboxed frames) and malformed values
  }
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  // Browsers always send Origin on cross-site unsafe requests; non-browser clients may omit it.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && origin && !isSameSite(request, origin)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  if (request.nextUrl.pathname === '/controller' || request.nextUrl.pathname.startsWith('/controller/')) {
    // Never accept caller-chosen authorization for scripts. 32 random bytes
    // are encoded as hex (also valid CSP nonce characters); Web Crypto works
    // in the existing middleware runtime without a new dependency.
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)),
      (byte) => byte.toString(16).padStart(2, '0')).join('');
    const isDev = process.env.NODE_ENV === 'development';
    const policy = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
    ].join('; ');
    const headers = new Headers(request.headers);
    headers.set('x-nonce', nonce);
    headers.set('Content-Security-Policy', policy);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set('Content-Security-Policy', policy);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  return NextResponse.next();
}

export const config = { matcher: ['/controller/:path*', '/api/controller/:path*'] };
