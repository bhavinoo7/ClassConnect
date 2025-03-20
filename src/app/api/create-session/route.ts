import { Teacher, session } from "@/model/Teacher";
import { Division } from "@/model/Division";
import { Attendance } from "@/model/Timetable";

import dbConnection from "@/lib/dbConnection";

import { Batch } from "@/model/Division";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const {
      start_time,
      end_time,
      division,
      teacher_id,
      subject,
      location,
      is_lab,
      subject_id,
      lab,
    } = await req.json();

    const data = new Date();
    const divisions = await Division.findById(division);

    let newsession: any;

    if (is_lab) {
      newsession = new session({
        start_time,
        end_time,
        session_name: subject,
        location,
        division_id: division,
        session_date: data,
        teacher: lab.teacher,
        status: "open",
        subject_id: lab.subject_id._id,
      });
    } else {
      newsession = new session({
        start_time,
        end_time,
        session_name: subject,
        location,
        division_id: division,
        session_date: data,
        teacher: teacher_id,
        status: "open",
        subject_id: subject_id,
      });
    }

    // await newsession.save();
    const teacher = await Teacher.findById(teacher_id);
    teacher.sessions.push(newsession._id);
    teacher.currentent_session = newsession._id;
    await teacher.save();

    if (is_lab) {
      const batch = await Batch.findById(lab.batch_id);

      batch?.students.map(async (student) => {
        const attendance = await new Attendance({
          student_id: student,
        });
        newsession.Attendance.push(attendance._id);
        attendance.save();
      });
    } else {
      divisions?.students.map(async (student: any) => {
        const attendance = await new Attendance({
          student_id: student,
        });
        attendance.save();
        newsession.Attendance.push(attendance._id);
      });
    }
    await newsession.save();
    return Response.json({
      success: true,
      message: "Session Created Successfully",
    });
  } catch (err) {
    console.error("Error occure in regisration", err);
    return Response.json(
      { sucess: false, message: "Error occure in regisration" },
      { status: 500 }
    );
  }
}
