import dbConnection from "@/lib/dbConnection";

import { Teacher, session } from "@/model/Teacher";
import { Attendance } from "@/model/Timetable";
import {
  Division,
  DivisionAttendance,
  Semester,
  Subject,
} from "@/model/Division";
import { StudentReport } from "@/model/Student";
import { Reports } from "@/model/Division";
import  Student  from "@/model/Student";

export async function POST(req: Request) {
  dbConnection();
  try {
    let { teacher_id } = await req.json();
    console.log("division close");
    console.log(teacher_id);
    const teacher = await Teacher.findById(teacher_id);
    console.log(teacher);
    const sessions = await session.findById(teacher.currentent_session);
    console.log(sessions);

    console.log(sessions);
    const Divisionattendance = new DivisionAttendance({
      division_id: sessions.division_id,
      date: new Date(),
      session_id: sessions._id,
      session_name: sessions.session_name,
      teacher_id: sessions.teacher,
      Attendance: sessions.Attendance,
    });
    await Divisionattendance.save();
    console.log(Divisionattendance);
    const Present: any[] = [];
    const Absent: any[] = [];
    const attendancepush: any[] = [];
    Divisionattendance.Attendance.map(async (attendance: any) => {
      const attendances = await Attendance.findById(attendance)
      console.log(attendances);
      attendancepush.push(attendances);

      if (attendances?.status === "Present") {
        console.log("Present");
        console.log(attendances.student_id);
        Present.push(attendances.student_id.toString());
      }
      if (attendances?.status === "Absent") {
        console.log("Absent");
        console.log(attendances.student_id);
        Absent.push(attendances.student_id.toString());
      }
    });

    console.log(Present);
    console.log(Absent);

    const subjects = await Subject.findById(sessions.subject_id);
    if (subjects) {
      subjects.total_session += 1;
      subjects.total_completed_session+=1;
    }
    subjects?.attendance.push(Divisionattendance._id as any);
    console.log(subjects);
    await subjects?.save();
    const division = await Division.findById(sessions.division_id);
    const semester = await Semester.findById(division?.current_semester);
    console.log(semester);

    semester?.sreports.map(async (se) => {
      console.log(se);
      const studentreport = await Reports.findById(se);
      console.log("B", studentreport);
      const report = await StudentReport.findById(studentreport?.report[0]);
      console.log("A", report);
      if (report && report.total_sessions !== undefined) {
        report.total_sessions += 1;
        if (Present.includes(report.student_id.toString())) {
          report.present_sessions += 1;
        }
        if (Absent.includes(report.student_id.toString())) {
          report.absent_sessions += 1;
        }
        report.percentage =
          (report.present_sessions / report.total_sessions) * 100;

        report.subjects.map((sub: any) => {
          if (sub.subject_id.toString() === sessions.subject_id.toString()) {
            sub.total_sessions += 1;
            if (Present.includes(report.student_id.toString())) {
              sub.present_sessions += 1;
              attendancepush.map(async (attendance) => {
                if (
                  attendance.student_id.toString() ===
                  report.student_id.toString()
                ) {
                  sub.attendance.push(attendance._id as any);
                }
              });
            }
            if (Absent.includes(report.student_id.toString())) {
              sub.absent_sessions += 1;
              attendancepush.map(async (attendance) => {
                if (
                  attendance.student_id.toString() ===
                  report.student_id.toString()
                ) {
                  sub.attendance.push(attendance._id as any);
                }
              });
            }
            sub.percentage = (sub.present_sessions / sub.total_sessions) * 100;
          }
        });
        console.log(report);
        await report.save();
      }
    });
    sessions.status = "closed";
    await sessions.save();
    teacher.currentent_session = null;
    await teacher.save();
    return Response.json({
      success: true,
      message: "Session closed successfully",
    });
  } catch (err) {
    console.error("Error occure in closed session", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in closed session",
      },
      {
        status: 500,
      }
    );
  }
}
