import dbConnection from "@/lib/dbConnection";
import bcrypt from "bcryptjs";

import { Division } from "@/model/Division";
import { Teacher } from "@/model/Teacher";

export async function POST(req: Request) {
  const { identifier, password, division_id } = await req.json();
  await dbConnection();
  try {
    const user1 = await Teacher.findById(identifier);

    if (!user1) {
      throw new Error("User not Found");
    }

    const checkPassword = await bcrypt.compare(password, user1.mentor.password);

    if (checkPassword) {
      const division = await Division.findById(division_id);
      const mentor = division?.mentor.includes(identifier);
      if (mentor) {
        const responseHeaders = new Headers();
        responseHeaders.append(
          "Set-Cookie",
          `divisionSession=${JSON.stringify({
            identifier,
            division_id,
          })}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
            24 * 60 * 60
          }`
        );

        return Response.json(
          {
            success: true,
            message: "Login is succesful",
          },
          { headers: responseHeaders }
        );
      } else {
        return Response.json({
          success: false,
          message: "You are not mentor of this division",
        });
      }
    } else {
      return Response.json({
        success: false,
        message: "Incorrect Password please enter valid passowrf",
      });
    }
  } catch (err: any) {
    console.log("Error occure", err);
    return Response.json({
      success: false,
      message: "Eroor occure in divison login",
    });
  }
}
