import dbConnection from "../../../lib/dbConnection";

import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

import bcrypt from "bcryptjs";
export async function POST(req: Request) {
  await dbConnection();
  try {
    const { userName, email, password, type } = await req.json();
    const findUserNameisExist = await UserModel.findOne({
      userName,
      isverfied: true,
    });
    if (findUserNameisExist) {
      return Response.json(
        {
          success: false,
          message: "This user name is already exist choose another",
        },
        {
          status: 400,
        }
      );
    }
    const findEmailisexist = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 * Math.random() + 900000).toString();
    if (findEmailisexist) {
      if (findEmailisexist.isverfied) {
        return Response.json(
          {
            success: false,
            message: "This email is already exists choose another email",
          },
          { status: 400 }
        );
      } else {
        const hashPassword = await bcrypt.hash(password, 10);
        const expiretime = new Date();
        expiretime.setHours(expiretime.getHours() + 1);
        findEmailisexist.password = hashPassword;
        findEmailisexist.varificationCode = verifyCode;
        findEmailisexist.verificationExpires = expiretime;
        await findEmailisexist.save();
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        userName,
        email,
        password: hashPassword,
        varificationCode: verifyCode,
        verificationExpires: expiryDate,
      });
      await newUser.save();
    }
    const emailRespose = await sendVerificationEmail(
      email,
      userName,
      verifyCode
    );
    if (!emailRespose.success) {
      return Response.json(
        {
          success: false,
          message: emailRespose.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "user Registered succefully. please verify user",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in regisration", err);
    return Response.json(
      { sucess: false, message: "Error occure in regisration" },
      { status: 500 }
    );
  }
}
