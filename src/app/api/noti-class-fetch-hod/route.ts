import dbConnection from "@/lib/dbConnection";
import mongoose from "mongoose";
import { Hod } from "@/model/Hod";
import { Division } from "@/model/Division";
import Student from "@/model/Student";
import { Teacher } from "@/model/Teacher";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const hod_id = url.searchParams.get("hod_id");

    console.log(hod_id);
    if (!hod_id) {
      return Response.json(
        {
          success: false,
          message: "Hod id is required",
        },
        { status: 400 }
      );
    }

    // Fetch HOD with division
    let h = await Hod.findById(new mongoose.Types.ObjectId(hod_id)).populate({
      path: "division",
      model: Division,
    });

    if (!h) {
      return Response.json(
        {
          success: false,
          message: "HOD not found",
        },
        { status: 404 }
      );
    }

    // Populate students and mentors inside divisions
    await h.populate({
      path: "division.students",
      model: Student,
    });

    await h.populate({
      path: "division.mentor",
      model: Teacher,
    });

    const data: any[] = [];
    h.division.map((div: any) => {
      div.students.map(
        (student: any) => {
          data.push({
            id: student._id,
            name: student.name,
            role: "student",
            class: div.division_code,
          });
        },
        div.mentor.map((mentor: any) => {
          data.push({
            id: mentor._id,
            name: `Professor. ${mentor.name}`,
            role: "teacher",
            department: div.division_code,
          });
        })
      );
    });

    return Response.json(
      {
        success: true,
        data: data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occurred in fetch class in hod", err);
    return Response.json(
      {
        success: false,
        message: "Error occurred in fetch class in hod",
      },
      { status: 500 }
    );
  }
}
