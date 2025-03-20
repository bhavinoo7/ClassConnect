import dbConnection from "@/lib/dbConnection";
import { Teacher } from "@/model/Teacher";
import { Division } from "@/model/Division";
import Student from "@/model/Student";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacher_id = url.searchParams.get("teacher_id");

    const teacher = await Teacher.findById(teacher_id)
      .populate({ path: "divisions", model: Division })
      .then(async (teacher) => {
        if (!teacher) return null;
        await teacher.populate({ path: "divisions.students", model: Student });
        return teacher;
      });
    if (!teacher) {
      return Response.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }
    const data: any = [];
    teacher.divisions.map((d: any) => {
      console.log(d);
      d.students.map((s: any) => {
        data.push({
          id: s._id.toString(),
          name: s.name,
          role: "student",
          class: d.division_code,
        });
      });
    });

    return Response.json({ success: true, data: data });
  } catch (err) {
    console.error("Error occure in noti-class-fetch GET route: ", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in noti-class-fetch GET route",
      },
      { status: 500 }
    );
  }
}
