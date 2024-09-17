import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';

// Specify protected and public routes
const protectedRoutes = ['/dashboard', "/otp"];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Use NextRequest to get cookies in the Edge Runtime
  const cookie = req.cookies.get('session')?.value;
  // If no session cookie and accessing a protected route, redirect to /sign-in
  if (!cookie && isProtectedRoute) {
    console.log("No session cookie found. Redirecting to /sign-in.");
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
