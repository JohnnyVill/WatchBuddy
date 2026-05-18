import { NextRequest, NextResponse } from 'next/server';
import { generalLimit, authLimit } from './app/lib/rateLimit';

// ── IP extraction ──────────────────────────────────────────────
function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'anonymous';
}

// ── Standard 429 response ──────────────────────────────────────
function rateLimited(limit: number, remaining: number, reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return new NextResponse(
    JSON.stringify({ message: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(retryAfter > 0 ? retryAfter : 1),
      },
    }
  );
}

// ── Session refresh ────────────────────────────────────────────
async function refreshSession(request: NextRequest, response: NextResponse): Promise<void> {
  const sessionCookie = request.cookies.get('userSession')?.value;
  if (!sessionCookie) return;

  try {
    const { decrypt, encrypt } = await import('./app/lib/session');
    const parsed = await decrypt(sessionCookie);
    parsed.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const newToken = await encrypt({
      userId: parsed.userId,
      username: parsed.username,
      expiresAt: parsed.expiresAt,
    });

    response.cookies.set({
      name: 'userSession',
      value: newToken,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: parsed.expiresAt,
    });
  } catch {
    // Expired or invalid session — nothing to refresh
  }
}

// ── Middleware entry point ─────────────────────────────────────
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limiting for API routes
  if (path.startsWith('/api/')) {
    const ip = getIP(request);
    const limiter = path.startsWith('/api/auth/') ? authLimit : generalLimit;
    const key = path.startsWith('/api/auth/') ? `${ip}:auth` : `${ip}:api`;

    const { success, limit, remaining, reset } = await limiter.limit(key);
    if (!success) {
      return rateLimited(limit, remaining, reset);
    }
  }

  const response = NextResponse.next();

  // Session refresh for page routes only
  if (!path.startsWith('/api/') && !path.startsWith('/_next/')) {
    await refreshSession(request, response);
  }

  return response;
}

// ── Matcher ────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.ico).*)',
  ],
};
