import Student from "@/model/Student";
import dbConnection from "@/lib/dbConnection";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { ApiResponse } from "@/types/ApiResponse";
import { StudentReport } from "@/model/Student";
import { Division, Semester } from "@/model/Division";
import { Reports } from "@/model/Division";
import { Subject } from "@/model/Division";
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
      division: data.divison,
      enroll_no: data.enroll_no,
      dob: data.dob,
      gender: data.gender,
      userid: user._id as mongoose.Schema.Types.ObjectId,
    });
    // await student1.save();
    user.studentid = student1._id as mongoose.Schema.Types.ObjectId;
    user.image = data.url;
    user.formfilled = true;
    const division=await Division.findById(data.divison);
    console.log(division)
    await user.save();
    const subject=await Semester.findById(division?.current_semester).populate({path:"subjects",model:Subject});
    console.log(subject);
    const sub=subject?.subjects.map((su: any)=>{return {subject_id:su._id,
      subject_name:su.subject_name,
      total_sessions:0,
      present_sessions:0,
      absent_sessions:0,
      percentage:0,
    }});
    const studentreport=new StudentReport({
      student_id:student1._id,
      subjects:sub
    })
    console.log(studentreport);
    await studentreport.save();
    const mainreport=new Reports({
      student_id:student1._id,
      student_name:student1.name,
      division_id:new mongoose.Types.ObjectId(data.divison),
      semester:division?.current_semester,
      start_date:subject?.start_date,
      end_date:subject?.end_date,
      report:[studentreport._id]
    })
    console.log(mainreport);
    await mainreport.save();
    student1.report.push(mainreport._id as mongoose.Schema.Types.ObjectId);
    subject?.sreports.push(mainreport._id as mongoose.Schema.Types.ObjectId);
    await subject?.save();
    await student1.save();
    console.log(student1);
    console.log(subject);
    return Response.json(
      { success: true, data: {id:student1._id,name:student1.name} },
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
