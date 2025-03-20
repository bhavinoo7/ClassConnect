import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from 'next-axiom'; // Example logging library

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/student-dashboard/:path*",
    "/teacher-dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/",
    "/verify/:path*",
    "/student-complete-profile/:path*",
    "/api/:path*",
    "/hod-dash/:path*",
    "/division-dashboard/:path*"
  ],
  runtime: 'nodejs',
};

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // Log the request path for debugging
    log.info(`Middleware triggered for URL: ${url.pathname}`);

    // Parse divisionSession cookie safely
    let divisionData = null;
    const divisionSession = request.cookies.get("divisionSession");
    if (divisionSession) {
      try {
        divisionData = JSON.parse(divisionSession.value);
      } catch (error) {
        log.error(`Failed to parse divisionSession cookie: ${error}`);
      }
    }

    // Redirect unauthenticated users
    if (!token) {
      if (
        url.pathname.startsWith("/student-dashboard") ||
        url.pathname.startsWith("/teacher-dashboard") ||
        url.pathname.startsWith("/hod-dash") ||
        url.pathname.startsWith("/division-dashboard")
      ) {
        log.info(`Redirecting unauthenticated user to /sign-in`);
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (
      token &&
      (url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify") ||
        url.pathname === "/")
    ) {
      if (!token.formfilled) {
        log.info(`Redirecting user to complete profile`);
        return NextResponse.redirect(new URL("/student-complete-profile", request.url));
      } else {
        if (token.usertype === "TEACHER") {
          return NextResponse.redirect(new URL("/teacher-dashboard", request.url));
        } else if (token.usertype === "STUDENT") {
          return NextResponse.redirect(new URL("/student-dashboard", request.url));
        } else if (token.usertype === "HOD") {
          return NextResponse.redirect(new URL("/hod-dash", request.url));
        }
      }
    }

    // Handle division dashboard access
    if (url.pathname.startsWith("/division-dashboard")) {
      if (token.usertype === "TEACHER" || token.usertype === "HOD") {
        if (!divisionData) {
          log.info(`Redirecting ${token.usertype} to their dashboard`);
          return NextResponse.redirect(
            new URL(token.usertype === "TEACHER" ? "/teacher-dashboard" : "/hod-dash", request.url)
          );
        }
        return NextResponse.next();
      }
    }

    // Redirect users to complete their profile if not filled
    if (!token.formfilled && url.pathname.startsWith("/student-complete-profile")) {
      log.info(`Redirecting user to complete profile`);
      return NextResponse.redirect(new URL("/student-complete-profile", request.url));
    }

    // Redirect users based on their role
    if (token.formfilled) {
      if (
        (token.usertype === "TEACHER" && url.pathname.startsWith("/student-dashboard")) ||
        (token.usertype === "STUDENT" && url.pathname.startsWith("/teacher-dashboard"))
      ) {
        log.info(`Redirecting ${token.usertype} to their dashboard`);
        return NextResponse.redirect(
          new URL(token.usertype === "TEACHER" ? "/teacher-dashboard" : "/student-dashboard", request.url)
        );
      }
    }

    // Allow access to other routes
    return NextResponse.next();
  } catch (error) {
    log.error(`Middleware error: ${error}`);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}