import dbConnection from "@/lib/dbConnection";
import { Semester } from "@/model/Division";
import mongoose from "mongoose";
export async function GET(req: Request) {
  try {
    await dbConnection();
    const url = new URL(req.url);
    const semester_id = url.searchParams.get("semester_id");

    if (semester_id) {
      const sem = await Semester.findById(
        new mongoose.Types.ObjectId(semester_id)
      );

      const data = [
        {
          Semester_id: sem?._id,
          Semester_name: sem?.semester_code,
          start_date: sem?.start_date,
          end_date: sem?.end_date,
        },
      ];
      return Response.json({
        success: true,
        data: data,
      });
    } else {
      throw new Error("semester_id is null");
    }
  } catch (err) {
    console.error("Error occure in the fetch sem in division ", err);
    return Response.json(
      {
        success: false,
        message: "Eroor occure in fetch semester in division",
      },
      { status: 500 }
    );
  }
}
