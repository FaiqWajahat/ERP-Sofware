import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request) {
  // 1. Get the token from the cookie
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Define routes
  const isProtectedRoute = pathname.startsWith("/Dashboard");
  const isPublicRoute = pathname === "/";
  // 3. Define Admin-Only Route
  const isAdminRoute = pathname.startsWith("/Dashboard/Quotations") || pathname.startsWith("/Dashboard/Users");

  // Case 1: Attempting to access protected route without a token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case 2: Verify token if it exists
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      
      // 4. CHANGE: Destructure 'payload' from verification to access user data
      const { payload } = await jwtVerify(token, secret); 

      // If token is valid and user is on the Login page, redirect to Dashboard
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/Dashboard", request.url));
      }

      // 5. CHANGE: Role-Based Access Control logic
      // If user tries to access Quotations but is NOT an Admin
      if (isAdminRoute && payload.role !== "Admin") {
        // Redirect them back to the main Dashboard (or an unauthorized page)
        return NextResponse.redirect(new URL("/Dashboard", request.url));
      }

    } catch (error) {
      console.error("Middleware: Invalid token", error);
      // Token is invalid or expired
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("auth_token");
        return response;
      }
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};