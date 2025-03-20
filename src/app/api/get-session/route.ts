import dbConnection from "@/lib/dbConnection";
import { Teacher } from "@/model/Teacher";
export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacher_id = url.searchParams.get("teacher_id");

    const teacher = await Teacher.findById(teacher_id);

    if (teacher.currentent_session !== null) {
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
