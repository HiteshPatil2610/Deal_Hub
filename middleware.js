import { NextResponse } from 'next/server';

const COOKIE_NAME = 'dealhub_admin_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/setup'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const hasCookie = req.cookies.get(COOKIE_NAME);
    if (!hasCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
