import UserModel from "@/model/User";
import dbConnection from "@/lib/dbConnection";

export async function POST(req: Request) {
  await dbConnection();
  let { username, code } = await req.json();
  const decodedUsername = decodeURIComponent(username);
  console.log(decodedUsername);
  console.log(code);
  try {
    const user = await UserModel.findOne({ userName: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    console.log("aaa");
    const isvalid = user.varificationCode === code;
    const expiryDatevalid = new Date(user.verificationExpires) > new Date();

    if (isvalid && expiryDatevalid) {
      user.isverfied = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified Successfully",
        },
        { status: 200 }
      );
    } else if (!expiryDatevalid) {
      return Response.json(
        {
          success: false,
          message: "Code is expire please sign-up again",
        },
        { status: 410 }
      );
    } else {
      return Response.json({
        success: false,
        message: "Verification code is incorrect",
      });
    }
  } catch (err) {
    console.error("Error occure in verification code", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in verification code",
      },
      { status: 500 }
    );
  }
}
