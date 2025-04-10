import { NextRequest, NextResponse } from "next/server";

// 1. Specify protected and public routes
const protectedRoutes = ["/transactions", "/contacts", "/dashboard"];
const authRoutes = ["/", "/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.includes(path);
  
  const companyID = req.cookies.get("companyID")?.value;
  const jwtToken = req.cookies.get("jwt")?.value; // Assuming the JWT is stored in a cookie named 'jwt'
  
  const hasValidAuth = !!companyID && !!jwtToken;
  
  // Case 1: Protected route but no valid auth -> redirect to login
  if (isProtectedRoute && !hasValidAuth) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  
  // Case 2: Auth route with valid auth -> redirect to dashboard
  if (isAuthRoute && hasValidAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};