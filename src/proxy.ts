import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Use next-auth's withAuth to protect these routes
  const authMiddleware = withAuth({
    pages: { signIn: "/" },
  });
  return authMiddleware(request as Parameters<typeof authMiddleware>[0], {} as Parameters<typeof authMiddleware>[1]);
}

export const config = {
  matcher: ["/dashboard/:path*", "/repos/:path*", "/settings/:path*"],
};
