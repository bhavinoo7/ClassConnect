import dbConnection from "@/lib/dbConnection";
import { Division, Reports, Subject } from "@/model/Division";
import { Semester } from "@/model/Division";
import Student, { StudentReport } from "@/model/Student";
import { Teacher } from "@/model/Teacher";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const division_id = url.searchParams.get("division_id");

    if (!division_id) {
      return Response.json(
        { success: false, message: "Division id is required" },
        { status: 400 }
      );
    }

    const teacher = await Division.findById(new mongoose.Types.ObjectId(division_id))
      .populate({ path: "semesters", model: Semester })
      .then(async (teacher) => {
        if (!teacher) return null;

        await teacher.populate({ path: "semesters.subjects", model: Subject });
        await teacher.populate({ path: "semesters.sreports", model: Reports });
        await teacher.populate({ path: "semesters.subjects.teacher_id", model: Teacher });
        await teacher.populate({ path: "semesters.sreports.student_id", model: Student });
        await teacher.populate({ path: "semesters.sreports.report", model: StudentReport });

        return teacher;
      });

    if (!teacher) {
      return Response.json(
        { success: false, message: "Division not found" },
        { status: 404 }
      );
    }

    const currentsemester = teacher.current_semester;
    const outputData = teacher.semesters.map((semester: any) => ({
      semester_id: semester._id,
      semester_name: semester.semester_code,
      current: semester._id.toString() === currentsemester?.toString(),
      total_subjects: semester.subjects.length,
      semester_start_date: semester.start_date,
      semester_end_date: semester.end_date,
      Subjects: semester.subjects.map((subject: any) => ({
        subject_id: subject._id,
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        teacher_id: subject.teacher_id?._id || null,
        teacher_name: subject.teacher_id?.name || "Unknown",
        total_session: subject.total_session,
        total_completed_session: subject.total_completed_session,
      })),
      studentr: semester.sreports.map((report: any) => ({
        student_id: report.student_id?._id || null,
        student_name: report.student_id?.name || "Unknown",
        student_enrollment: report.student_id?.enroll_no || "N/A",
        total_session: report.report?.[0]?.total_sessions || 0,
        present_sessions: report.report?.[0]?.present_sessions || 0,
        absent_sessions: report.report?.[0]?.absent_sessions || 0,
        percentage: report.report?.[0]?.percentage || 0,
      })),
    }));

    return Response.json({
      success: true,
      data: outputData,
    });
  } catch (err) {
    console.error("❌ Error occurred in fetch division dashboard data:", err);
    return Response.json(
      {
        success: false,
        message: "Error occurred in fetch division dashboard data",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
