import dbConnection from "@/lib/dbConnection";

import Student, { StudentReport } from "@/model/Student";
import mongoose from "mongoose";
import { Reports } from "@/model/Division";

import { Attendance } from "@/model/Timetable";
export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    let studentid = url.searchParams.get("studentid");
    let semester = url.searchParams.get("semester");

    if (!studentid) {
      throw new Error("studentid is required");
    }
    const student = await Student.findById(
      new mongoose.Types.ObjectId(studentid)
    ).populate({
      path: "report",
      model: Reports,
      populate: {
        path: "report",
        model: StudentReport,
        populate: {
          path: "subjects.attendance",
          model: Attendance,
        },
      },
    });

    const report: any[] = [];
    student?.report.filter((s: any) => {
      if (s.semester.toString() === semester) {
        report.push(s.report);
      }
    });

    return Response.json({
      success: true,
      data: report[0],
    });
  } catch (err) {
    console.error("Error occure in fetch report", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in fetch report",
      },
      { status: 500 }
    );
  }
}
