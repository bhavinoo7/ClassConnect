import dbConnection from "@/lib/dbConnection";
import { Department } from "@/model/Hod";
import { Division } from "@/model/Division";
export async function POST(req: Request) {
  await dbConnection();
  const { department_id } = await req.json();
  try {
    const department = await Department.findById(department_id).populate({
      path: "divisions",
      model: Division,
    });

    const divisions = department.divisions.map((d: any) => {
      return { name: d.division_name, id: d._id };
    });

    return Response.json({
      success: true,
      data: divisions,
    });
  } catch (err) {
    console.error("Error occure in Fetch Division", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in Fetch Division",
      },
      { status: 500 }
    );
  }
}
