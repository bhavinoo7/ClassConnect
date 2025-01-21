import dbConnection from "@/lib/dbConnection";

import { Teacher, session } from "@/model/Teacher";
import { Attendance } from "@/model/Timetable";
import { Division, DivisionAttendance } from "@/model/Division";
import { ObjectId } from "mongoose";
export async function POST(req: Request) {
  dbConnection();
  try {
    let {teacher_id,division_id}=await req.json();
    console.log("division close");
    console.log(division_id);
    console.log(teacher_id);
    const teacher=await Teacher.findById(teacher_id);
    console.log(teacher);
    const sessions=await session.findById(teacher.currentent_session).populate({path:"Attendance",model:Attendance});
    console.log(sessions);
    let at:any=[];
    const attendances=sessions.Attendance.map((attendance:any)=>{
      if(attendance.status=="Not marked")
      {
        attendance.status="Absent";
      }
      const attendances=new Attendance(
        {
          student_id:attendance.student_id,
          status:attendance.status,
          date:attendance.date,
          IP:attendance.IP,
          location:attendance.location,
          distance:attendance.distance,
          image:attendance.image
        }
      );
      console.log(attendances);
      attendances.save();
      at.push(attendances._id);
    })
    console.log(at);

    console.log(sessions);
    const Divisionattendance=new DivisionAttendance({
        division_id:division_id,
        date:new Date(),
        session_id:sessions._id,  
        session_name:sessions.session_name,
        teacher_id:sessions.teacher,
        Attendance:at
    })
    console.log(Divisionattendance);
    Divisionattendance.save();
    const division=await Division.findById(division_id);
    console.log(division);
    division?.attendance.push(Divisionattendance._id as ObjectId);
    division?.save();
    sessions.status="closed";
    await sessions.save();
    teacher.currentent_session=null;
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
