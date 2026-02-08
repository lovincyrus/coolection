import {
  clerkMiddleware,
  ClerkMiddlewareAuth,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/lists(.*)",
  "/settings(.*)",
]);

// See: https://clerk.com/docs/references/nextjs/clerk-middleware
export default clerkMiddleware(
  (auth: ClerkMiddlewareAuth, req: NextRequest) => {
    // Skip Clerk auth for requests using API token auth
    const authorization = req.headers.get("authorization");
    if (authorization?.startsWith("Bearer coolection_")) {
      return NextResponse.next();
    }

    const homeUrl = new URL("/home", req.url);

    // Redirect to /home if user is signed in
    if (auth().userId && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(homeUrl);
    }

    // Redirect to / if user is signed out
    if (!auth().userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
