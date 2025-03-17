// from https://nextjs.org/docs/pages/building-your-application/authentication 
import { NextRequest, NextResponse } from 'next/server'
import Cookies from 'js-cookie'
 
// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/contacts', '/welcome', '/transactions']
const publicRoutes = ['/onboarding', '/']
 
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && Cookies.get("userID")) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    Cookies.get("userID") &&
    !req.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}