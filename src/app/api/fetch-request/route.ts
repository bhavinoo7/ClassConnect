import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import Student from "@/model/Student";
import mongoose from "mongoose";
export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const division_id = url.searchParams.get("division_id");

    if (!division_id) {
      return Response.json(
        {
          success: false,
          message: "Division id is required",
        },
        { status: 400 }
      );
    }
    const div = await Division.findById(
      new mongoose.Types.ObjectId(division_id)
    ).populate({ path: "request", model: Student });

    if (!div) {
      return Response.json(
        {
          success: false,
          message: "Division not found",
        },
        { status: 404 }
      );
    }
    const requ = div.request.map((r: any) => {
      return {
        student_id: r._id,
        student_name: r.name,
        enroll_no: r.enroll_no,
      };
    });

    return Response.json(
      {
        success: true,
        data: requ,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in fetch request", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in fetch request",
      },
      { status: 500 }
    );
  }
}
