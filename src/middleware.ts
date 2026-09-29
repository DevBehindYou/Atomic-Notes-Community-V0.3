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
  return NextResponse.next();
}

export const config = { matcher: '/api/controller/:path*' };
