import { NextResponse } from "next/server";
export async function POST() {
    const response = new NextResponse(
        JSON.stringify({ message: "Logged out successfully" }),
        { status: 200 }
      );

      response.headers.append("Set-Cookie", "divisionSession=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict");

      return response;

}