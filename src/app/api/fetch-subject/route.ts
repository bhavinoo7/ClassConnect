import dbConnection from "@/lib/dbConnection";
import { Teacher } from "@/model/Teacher";
import { DivisionAttendance, Subject } from "@/model/Division";
import mongoose from "mongoose";
import Student from "@/model/Student";
import { Attendance } from "@/model/Timetable";
export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacherid = url.searchParams.get("teacherid");

    if (!teacherid) {
      return Response.json(
        {
          success: false,
          message: "teacherid is required",
        },
        { status: 400 }
      );
    }

    const teacher = await Teacher.findById(
      new mongoose.Types.ObjectId(teacherid)
    )
      .populate({ path: "subject", model: Subject }) // First populate 'subject'
      .then(async (teacher) => {
        if (!teacher) return null;

        // Populate 'subject.attendance'
        await teacher.populate({
          path: "subject.attendance",
          model: DivisionAttendance,
        });

        // Populate 'attendance.Attendance' inside 'subject.attendance'
        await teacher.populate({
          path: "subject.attendance.Attendance",
          model: Attendance,
        });

        await teacher.populate({
          path: "subject.attendance.Attendance.student_id",
          model: Student,
        });

        return teacher;
      });

    return Response.json({
      success: true,
      data: teacher.subject,
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Error occure in fetching subject",
      },
      { status: 500 }
    );
  }
}
