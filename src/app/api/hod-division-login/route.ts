import dbConnection from "@/lib/dbConnection";
import { Hod } from "@/model/Hod";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const { hod_id, division_id } = await req.json();
    const hod = await Hod.findById(hod_id);

    if (!hod) {
      return Response.json(
        {
          success: false,
          message: "Hod not found",
        },
        { status: 400 }
      );
    }
    if (hod.division.includes(division_id)) {
      const responseHeaders = new Headers();
      responseHeaders.append(
        "Set-Cookie",
        `divisionSession=${JSON.stringify({
          identifier: hod_id,
          division_id,
        })}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`
      );

      return Response.json(
        {
          success: true,
          message: "Login is succesful",
        },
        { headers: responseHeaders }
      );
    }
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Error occure in division login",
      },
      { status: 500 }
    );
  }
}
