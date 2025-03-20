import { Teacher } from "@/model/Teacher";

import dbConnection from "@/lib/dbConnection";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const Teachers = await Teacher.aggregate([
      {
        $project: {
          teacher: {
            _id: "$_id",
            name: "$name",
          },
        },
      },
      {
        $group: {
          _id: null,
          teachers: {
            $push: "$teacher",
          },
        },
      },
    ]);

    return Response.json({
      success: true,
      data: Teachers[0].teachers,
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
