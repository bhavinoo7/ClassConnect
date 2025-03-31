import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
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
    "/division-dashboard/:path*",
    "/pending/:path*"
  ],
};

export async function middleware(request: NextRequest) {
  const divisionSession = request.cookies.get("divisionSession");

  const divisionData = divisionSession
    ? JSON.parse(divisionSession.value)
    : null;

  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    token?.usertype == "TEACHER" &&
    url.pathname.startsWith("/division-dashboard") &&
    divisionData !== null
  ) {
    return NextResponse.next();
  }
  if (
    token?.usertype == "HOD" &&
    url.pathname.startsWith("/division-dashboard") &&
    divisionData !== null
  ) {
    return NextResponse.next();
  }
  if (
    token?.usertype == "TEACHER" &&
    url.pathname.startsWith("/division-dashboard") &&
    divisionData === null
  ) {
    return NextResponse.redirect(new URL("/teacher-dashboard", request.url));
  }
  if (
    token?.usertype == "HOD" &&
    url.pathname.startsWith("/division-dashboard") &&
    divisionData === null
  ) {
    return NextResponse.redirect(new URL("/hod-dash", request.url));
  }
  if (!token && url.pathname.startsWith("/student-complete-profile")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (
    token &&
    token.formfilled &&
    url.pathname.startsWith("/student-complete-profile")
  ) {
    if (token.usertype === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher-dashboard", request.url));
    } else if (token.usertype === "STUDENT") {
      return NextResponse.redirect(new URL("/student-dashboard", request.url));
    }
  }
  if (
    token &&
    (url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    if (token?.usertype === "TEACHER" && !token?.formfilled) {
      if (!token) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return NextResponse.redirect(
        new URL("student-complete-profile", request.url)
      );
    } else if (token?.usertype === "STUDENT" && !token?.formfilled) {
      if (!token) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return NextResponse.redirect(
        new URL("student-complete-profile", request.url)
      );
    }
    if (token?.usertype === "TEACHER" && token?.formfilled) {
      return NextResponse.redirect(new URL("/teacher-dashboard", request.url));
    } else if (token?.usertype === "STUDENT" && token?.formfilled) {
      if(!token.isaccepted)
      {
        return NextResponse.redirect(new URL("/pending",request.url));
      }
      return NextResponse.redirect(new URL("/student-dashboard", request.url));
    } else if (token?.usertype === "HOD" && token?.formfilled) {
      return NextResponse.redirect(new URL("/hod-dash", request.url));
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (
    token == null &&
    (url.pathname.startsWith("/student-dashboard") ||
      url.pathname.startsWith("/teacher-dashboard") ||
      url.pathname.startsWith("/hod-dash") ||
      url.pathname.startsWith("/division-dashboard"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (
    token &&
    (url.pathname.startsWith("/student-dashboard") ||
      url.pathname.startsWith("/teacher-dashboard"))
  ) {
    if (token.formfilled === false) {
      return NextResponse.redirect(
        new URL("/student-complete-profile", request.url)
      );
    }
    if (
      token?.usertype === "TEACHER" &&
      url.pathname.startsWith("/student-dashboard")
    ) {
      return NextResponse.redirect(new URL("/teacher-dashboard", request.url));
    } else if (
      token?.usertype === "STUDENT" &&
      url.pathname.startsWith("/teacher-dashboard")
    ) {
      return NextResponse.redirect(new URL("/student-dashboard", request.url));
    } else {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}
