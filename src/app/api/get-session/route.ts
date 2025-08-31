import dbConnection from "@/lib/dbConnection";
import { session, Teacher } from "@/model/Teacher";
import { Session } from "inspector/promises";
export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacher_id = url.searchParams.get("teacher_id");

    const teacher = await Teacher.findById(teacher_id);

    if (teacher.currentent_session !== null) {
      const sessio = await session.findById(teacher.currentent_session);
      if(sessio && sessio.status==="open" && new Date(sessio.end_time)>new Date()){
        {
          sessio.status="closed";
          await sessio.save();
          teacher.currentent_session=null;
          await teacher.save();
        }
        return Response.json({
        success: false,
        message: "session not found",
      });
      }
      return Response.json({
        success: true,
        data: teacher.currentent_session,
      });
    } else {
      return Response.json({
        success: false,
        message: "session not found",
      });
    }
  } catch (err) {
    console.error("Error occure in get seesion", err);
    return Response.json({
      success: false,
      message: "Error occure in get sesssion",
    });
  }
}
