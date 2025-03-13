import dbConnection from "@/lib/dbConnection";
import { session } from "@/model/Teacher";
import { Attendance } from "@/model/Timetable";
import Student from "@/model/Student";

export interface atendance {
  student_id: string;
  student_name?: string;
  status: string;
  vote?: number;
  confidence?: number;
  date?: Date;
}

export async function POST(req: Request) {
  await dbConnection();

  try {
    const { session_id, recognize } = await req.json();

    console.log(recognize);
    const sessi = await session.findById(session_id);
    if (!sessi) {
      return Response.json(
        {
          success: false,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    const rs = recognize.map((r: any) => r.student_id);
    console.log(rs);

    let students: any[] = [];

    await Promise.all(
      sessi.Attendance.map(async (attendanceId: any) => {
        console.log(attendanceId);
        let attendanc = await Attendance.findById(attendanceId).populate({path:"student_id",model:Student});
        console.log(attendanc);

        if (!attendanc) return;

        if (rs.includes((attendanc.student_id as any)._id.toString())) {
          console.log("Present");

          if (attendanc.status === "Not marked") {
            const recognizedStudent = recognize.find(
              (r: any) => r.student_id === (attendanc.student_id as any)._id.toString()
            );

            if (recognizedStudent) {
              attendanc.status = "Present";
              attendanc.vote = recognizedStudent.votes;
              attendanc.confidence = recognizedStudent.confidence;
              attendanc.date = new Date();
              students.push(attendanc);
              await attendanc.save();
            }
          }
        } else {
          attendanc.status = "Absent";
          attendanc.date = new Date();
          await attendanc.save();
        }
      })
    );

    
    console.log("AA", students);
    console.log(sessi);

    return Response.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data: students,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occurred in fetch attendance", err);
    return Response.json(
      {
        success: false,
        message: "Error occurred in fetch attendance",
      },
      { status: 500 }
    );
  }
}
