// from https://nextjs.org/docs/pages/building-your-application/authentication
import { NextRequest, NextResponse } from "next/server";

// 1. Specify protected and public routes
const protectedRoutes = ["/transactions", "/contacts", "/dashboard"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const companyID = req.cookies.get("companyID")?.value; // Get the cookie value

  // Redirect if the user is not authenticated
  if (isProtectedRoute && !companyID) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
