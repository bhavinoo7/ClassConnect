import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import Student from "@/model/Student";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { Semester } from "@/model/Division";
import { Subject } from "@/model/Division";
import { StudentReport } from "@/model/Student";
import { Reports } from "@/model/Division";
export async function POST(req: Request) {
  await dbConnection();
  try {
    const { student_id, division_id } = await req.json();

    // Convert division_id to ObjectId
    const div = await Division.findById(
      new mongoose.Types.ObjectId(division_id)
    );
    if (!div) {
      return Response.json(
        { success: false, message: "Division not found" },
        { status: 404 }
      );
    }

    // Filter out requests that are accepted
    div.request = div.request.filter(
      (r: any) => !student_id.includes(r.toString())
    );

    // ✅ Fix: Convert each student_id to ObjectId before pushing
    div.students.push(
      ...student_id.map((id: string) => new mongoose.Types.ObjectId(id))
    );

    // Save updated division

    // await div.save();

    // Process each student
    for (const s of student_id) {
      const student = await Student.findById(new mongoose.Types.ObjectId(s));
      if (!student) {
        return Response.json(
          { success: false, message: "Student not found" },
          { status: 404 }
        );
      }
      const subject = await Semester.findById(div?.current_semester).populate({
        path: "subjects",
        model: Subject,
      });

      const sub = subject?.subjects.map((su: any) => {
        return {
          subject_id: su._id,
          subject_name: su.subject_name,
          total_sessions: su.total_session,
          present_sessions: 0,
          absent_sessions: 0,
          percentage: 0,
        };
      });
      const studentreport = new StudentReport({
        student_id: student._id,
        total_sessions: sub
          ?.map((s) => s.total_sessions)
          .reduce((a, b) => a + b, 0),
        subjects: sub,
      });

      await studentreport.save();
      const mainreport = new Reports({
        student_id: student._id,
        student_name: student.name,
        division_id: div?._id,
        semester: div?.current_semester,
        start_date: subject?.start_date,
        end_date: subject?.end_date,
        report: [studentreport._id],
      });

      await mainreport.save();

      student.report.push(mainreport._id as mongoose.Schema.Types.ObjectId);
      subject?.sreports.push(mainreport._id as mongoose.Schema.Types.ObjectId);

      await student.save();
      await subject?.save();

      const user = await UserModel.findById(student?.userid);
      if (user) {
        user.isaccepted = true;

        await user.save();
      }
    }
    await div.save();

    return Response.json(
      { success: true, message: "Request accepted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occurred in accept request", err);
    return Response.json(
      { success: false, message: "Error occurred in accept request" },
      { status: 500 }
    );
  }
}
