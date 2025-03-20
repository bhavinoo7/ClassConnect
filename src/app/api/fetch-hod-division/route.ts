import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Hod } from "@/model/Hod";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const hod_id = url.searchParams.get("hod_id");
    if (!hod_id) {
      return Response.json({
        success: false,
        message: "hod id is requre",
      });
    }
    const hod = await Hod.findById(hod_id).populate({
      path: "division",
      model: Division,
    });

    const data: any[] = [];
    hod.division.map((d: any) => {
      data.push({
        id: d._id,
        name: d.division_code,
      });
    });

    return Response.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Errror occure in fetch division of hod");
    return Response.json(
      {
        success: false,
        message: "Error occure in fetch division in the hod",
      },
      { status: 500 }
    );
  }
}
