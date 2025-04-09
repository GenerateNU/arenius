// from https://nextjs.org/docs/pages/building-your-application/authentication
import { NextRequest, NextResponse } from "next/server";

// 1. Specify protected and public routes
const protectedRoutes = ["/transactions", "/contacts", "/dashboard"];

const authRoutes = ["/", "/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const companyID = req.cookies.get("companyID")?.value; // Get the cookie value
  const isAuthRoute = authRoutes.includes(path);

  const authCookieHasValue = !!companyID;
  
  // Case 1: Protected route but no valid cookie -> redirect to login
  if (isProtectedRoute && !authCookieHasValue) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  
  // Case 2: Already on an auth route and potentially has a broken cookie (causing loops)
  // In this case, we should clear the problematic cookie
  if (isAuthRoute && authCookieHasValue) {
    // Clear the potentially problematic cookie but don't redirect again
    // This breaks the redirect loop
    const response = NextResponse.next();
    response.cookies.delete("companyID");
    
    // Also clear any other auth-related cookies that might be causing issues
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");
    response.cookies.delete("auth");
    
    return response;
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
