"server only";

import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';
import { cookies } from 'next/headers';
// Specify protected and public routes
const protectedRoutes = ['/dashboard', "/otp", "/verified-email", "/reset-password", "/forgot-password", "/verify-email"];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = cookies().get("session")?.value;

  if (!cookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
  }

  if (!cookie && isPublicRoute) {
    return NextResponse.next(); 
  }

  try {
    const session = await decrypt(cookie!);
    if (isProtectedRoute && !session.sessionId) {
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
    }

    // If session is valid and accessing a public route, redirect to /dashboard
    // Check the cookie hasn't expired
    const currentTime = new Date().getTime();
    if (session.expiresAt < currentTime) {
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
    }


    if (isPublicRoute && session.sessionId) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

  } catch (error) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
    }
  }

  // Default behavior: allow the request to proceed
  return NextResponse.next();
}

// Apply the middleware to specific routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
