import dbConnection from "@/lib/dbConnection";
import { Division, Reports, Subject } from "@/model/Division";
import { Semester } from "@/model/Division";
import Student, { StudentReport, studentReportSchema } from "@/model/Student";
import { Teacher } from "@/model/Teacher";
import { division } from "@/types/ApiResponse";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const division_id = url.searchParams.get("division_id");
    console.log(division_id);
    if (!division_id) {
      throw new Error("Division id is required");
    }
    const teacher = await Division.findById(
      new mongoose.Types.ObjectId(division_id)
    )
      .populate({ path: "semesters", model: Semester }) // First populate 'subject'
      .then(async (teacher) => {
        if (!teacher) return null;

        // Populate 'subject.attendance'
        await teacher.populate({
          path: "semesters.subjects",
          model: Subject,
        });

        // Populate 'attendance.Attendance' inside 'subject.attendance'
        await teacher.populate({
          path: "semesters.sreports",
          model: Reports,
        });

        await teacher.populate({
          path: "semesters.subjects.teacher_id",
          model: Teacher,
        });

        await teacher.populate({
          path: "semesters.sreports.student_id",
          model: Student,
        });

        await teacher.populate({
          path: "semesters.sreports.report",
          model: StudentReport,
        });

        return teacher;
      });
    console.log(teacher);
    const currentsemester = teacher?.current_semester;
    console.log(currentsemester);

    const outputData: {
      studentr(studentr: any): unknown;
      semester_id: any;
      current: any;
      semester_name: any;
      Subjects: any;
      total_subjects: any;
      semester_start_date: any;
      semester_end_date: any;
    }[] = [];
    teacher?.semesters.map((semester: any) => {
      const semesterData = {
        semester_id: (semester as any)._id,
        semester_name: (semester as any).semester_code,
        current: semester._id.toString() == currentsemester?.toString() ? true : false,
        total_subjects: semester.subjects.length,
        semester_start_date: semester.start_date,
        semester_end_date: semester.end_date,
        Subjects: semester.subjects.map((subject: any) => {
          const subjectData = {
            subject_id: subject._id,
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            teacher_id: subject.teacher_id._id,
            teacher_name: subject.teacher_id.name,
            total_session: subject.total_session,
            total_completed_session: subject.total_completed_session,
          };
          return subjectData;
        }),
        studentr: semester.sreports.map((report: any) => {
          const reportData = {
            student_id: report.student_id._id,
            student_name: report.student_id.name,
            student_enrollment: report.student_id.enroll_no,
            total_session: report.report[0].total_sessions,
            present_sessions: report.report[0].present_sessions,
            absent_sessions: report.report[0].absent_sessions,
            percentage: report.report[0].percentage,
          };
          return reportData;
        }),
      };
      return outputData.push(semesterData);
    });
    console.log(outputData);

    return Response.json({
      success: true,
      data: outputData,
    });
  } catch (err) {
    console.error("Error ocuure in fetch division dashboard data", err);
    Response.json(
      {
        success: false,
        message: "Eroor occure in fetch division dashboard data",
      },
      { status: 500 }
    );
  }
}
