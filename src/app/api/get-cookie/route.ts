import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("divisionSession")?.value || "{}";

  let parsedObject = {};
  try {
    parsedObject = JSON.parse(cookieValue);
  } catch (error) {
    console.error("Error parsing API cookie:", error);
  }

  return NextResponse.json({ divisionSession: parsedObject });
}
