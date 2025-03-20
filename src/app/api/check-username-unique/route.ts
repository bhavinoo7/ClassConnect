import UserModel from "@/model/User";
import { z } from "zod";
import dbConnection from "@/lib/dbConnection";
import { userNameValidation } from "@/schemas/SignUpSchema";

const userNameValidationquery = z.object({
  username: userNameValidation,
});

export async function GET(req: Request) {
  await dbConnection();
  try {
    const { searchParams } = new URL(req.url);
    const queryparmas = { username: searchParams.get("username") };
    const result = userNameValidationquery.safeParse(queryparmas);
    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameError?.length > 0
              ? usernameError.join(", ")
              : "invalid query parameter",
        },
        { status: 400 }
      );
    }
   
    const { username } = result.data;
    const userNameExist = await UserModel.findOne({
      userName: username,
      isverfied: true,
    });
    if (userNameExist) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error("Error in username unique", error);
    return Response.json(
      {
        success: false,
        message: "Error occure in username validatation",
      },
      { status: 500 }
    );
  }
}
