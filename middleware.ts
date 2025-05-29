import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Skip authentication for login and register routes
    if (
      request.nextUrl.pathname.startsWith("/api/auth/login") ||
      request.nextUrl.pathname.startsWith("/api/auth/register")
    ) {
      return NextResponse.next()
    }

    // Skip authentication for GET requests to properties
    if (request.nextUrl.pathname.startsWith("/api/properties") && request.method === "GET") {
      return NextResponse.next()
    }

    // For all other API routes, just check if token exists
    const token = request.cookies.get("token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
}
