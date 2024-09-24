"server only";

import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';

// Specify protected and public routes
const protectedRoutes = ['/dashboard',];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const sessionCookie = req.cookies.getAll();
  console.log(sessionCookie);
  // If the route is public, continue to the next middleware
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If the route is protected, check if the session is valid
  if (isProtectedRoute) {
    // Decrypt the session cookie
    

    
    return NextResponse.next();
  }
}

// Apply the middleware to specific routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
