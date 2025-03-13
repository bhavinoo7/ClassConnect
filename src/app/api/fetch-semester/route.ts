import dbConnection from "@/lib/dbConnection";
import { Reports,Semester } from "@/model/Division";
import Student from "@/model/Student";
import mongoose from "mongoose";
import { start } from "repl";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const studentid = url.searchParams.get("studentid");
    console.log(studentid);

    if (!studentid) {
      throw new Error("studentid is required");
    }
    const students = await Student.findById(new mongoose.Types.ObjectId(studentid)).populate({
      path: "report",
      model: Reports,
      populate: {
        path: "semester",
        model: Semester,
      },
    });

    console.log(students);
    const sem = students?.report.map((s: any) => {
      return{
        Semester_name: s.semester.semester_name,
        Semester_id: s.semester._id,
        start_date: s.semester.start_date,
        end_date: s.semester.end_date,
      }
      
    });
    return Response.json(
      {
        success: true,
        data: sem,
      },
      { status: 200 }
    );
    
  } catch (err) {
    console.error("Error occurred in Fetch Semester", err);
    return Response.json(
      {
        success: false,
        message: "Error occurred in Fetch Semester",
      },
      { status: 500 }
    );
  }
}
