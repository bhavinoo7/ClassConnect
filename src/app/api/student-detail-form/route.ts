import Student from "@/model/Student";
import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/User";
import mongoose from "mongoose";

import { Division, Semester } from "@/model/Division";

export async function POST(req: Request) {
  await dbConnection();
  let { data } = await req.json();

  try {
    let user = await UserModel.findOne({ _id: data.id });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    const student1 = new Student({
      name: data.fullname,
      email: user.email,
      contact_no: data.contact_no,
      address: data.address,
      branch_name: data.branch_name,
      division: data.divison,
      enroll_no: data.enroll_no,
      dob: data.dob,
      gender: data.gender,
      userid: user._id as mongoose.Schema.Types.ObjectId,
    });
    // await student1.save();
    user.studentid = student1._id as mongoose.Schema.Types.ObjectId;
    user.image = data.url;
    user.isaccepted = false;
    user.formfilled = true;
    const division = await Division.findById(data.divison);

    await user.save();

    division?.request.push(student1._id as mongoose.Schema.Types.ObjectId);
    await division?.save();

    await student1.save();

    return Response.json(
      { success: true, data: { id: student1._id, name: student1.name } },
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
