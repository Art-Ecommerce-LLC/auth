"server only";

import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
// Specify protected and public routes
const cookieRoutes = ['/dashboard','/otp','/reset-password','/verify-email','/sign-out'];
const publicRoutes = ['/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the current route is protected or public
  const isProtectedRoute = cookieRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const sessionCookie = req.cookies.getAll();
  console.log(sessionCookie);
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

}

// Apply the middleware to specific routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
