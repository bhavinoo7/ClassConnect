import Student from "@/model/Student";
import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(req: Request) {
  await dbConnection();
  let { data } = await req.json();
  console.log(data);
  console.log("aaaa");
  try {
    let user = await UserModel.findOne({ _id: data.id });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }
    console.log("bbnnnn00");
    const student1 = new Student({
      name: data.fullname,
      email: user.email,
      contact_no: data.contact_no,
      address: data.address,
      branch_name: data.branch_name,
      division: data.division,
      enroll_no: data.enroll_no,
      dob: data.dob,
      gender: data.gender,
      userid: user._id as mongoose.Schema.Types.ObjectId,
    });
    await student1.save();
    user.studentid = student1._id as mongoose.Schema.Types.ObjectId;
    user.image = data.url;
    user.formfilled = true;
    await user.save();
    return Response.json(
      { success: true, message: "Student details saved" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in the student save details", err);

    return Response.json(
      {
        success: false,
        message: "Error occure in the student save details",
        err,
      },
      { status: 500 }
    );
  }
}
