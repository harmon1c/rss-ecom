import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export default function middleware(req: NextRequest): NextResponse {
  const path = req.nextUrl.pathname;
  const authRequiredRoutes = ['/account', '/checkout'];
  const guestOnlyRoutes = ['/login', '/sign-up'];
  const isLogged = !!cookies().get('login')?.value;

  if (guestOnlyRoutes.includes(path) && isLogged) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (authRequiredRoutes.some((route) => path.startsWith(route)) && !isLogged) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/sign-up', '/account/:path*', '/checkout/:path*'],
};
