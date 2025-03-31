import { Teacher } from "@/model/Teacher";
import { Department } from "@/model/Hod";
import dbConnection from "@/lib/dbConnection";
import { Hod } from "@/model/Hod";
import mongoose from "mongoose";
import { division } from "@/types/ApiResponse";
import { Division } from "@/model/Division";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hodid = searchParams.get("hodid");
  const Divisionid = searchParams.get("divisionid");
  let id;
  await dbConnection();
  try {
    if (hodid) {
      const hod = await Hod.findById(hodid);
      id = hod.department;
    } else {
      const div = await Division.findById(Divisionid);
      id = div?.department;
    }

    const result = await Department.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, // Match the given department ID
      },
      {
        $lookup: {
          from: "teachers", // Collection name for teachers
          localField: "teachers", // Assuming "teachers" field stores teacher IDs
          foreignField: "_id",
          as: "teacherDetails",
        },
      },
      {
        $unwind: "$teacherDetails", // Convert array into separate documents
      },
      {
        $project: {
          _id: "$teacherDetails._id",
          name: "$teacherDetails.name",
        },
      },
    ]);

    console.log(result);

    return Response.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error in fetching teacher", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in fetching teacher",
      },
      { status: 500 }
    );
  }
}
