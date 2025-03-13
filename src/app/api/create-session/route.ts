import UserModel from "@/model/User";
import { Teacher, session } from "@/model/Teacher";
import { Division } from "@/model/Division";
import { Attendance } from "@/model/Timetable";

import dbConnection from "@/lib/dbConnection";
import mongoose, { set } from "mongoose";
import { Batch } from "@/model/Division";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const {
      start_time,
      end_time,
      division_id,
      teacher_id,
      subject,
      location,
      is_lab,
      batch_id,
      subject_id
    } = await req.json();
    console.log(start_time);
    const data = new Date();
    const division = await Division.findById(division_id);
    console.log(division);

    const newsession = new session({
      start_time,
      end_time,
      session_name: subject,
      location,
      division_id,
      session_date: data,
      teacher: new mongoose.Types.ObjectId(teacher_id),
      status: "open",
      subject_id
    });
    newsession.teacher = teacher_id;
    await newsession.save();
    const teacher = await Teacher.findById(teacher_id);
    teacher.sessions.push(newsession._id);
    teacher.currentent_session = newsession._id;
    await teacher.save();
    console.log(teacher);
    console.log(newsession);
    if (is_lab) {
      const batch = await Batch.findById(batch_id);
      console.log(batch);

      batch?.students.map(async (student) => {
        const attendance = await new Attendance({
          student_id: student,
        });
        await attendance.save();
      });
    } else {
      division?.students.map(async (student) => {
        const attendance = await new Attendance({
          student_id: student,
        });
        attendance.save();
        newsession.Attendance.push(attendance._id);
        
      });
      newsession.save();
    }
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
