import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Teacher } from "@/model/Teacher";
export async function POST(req: Request) {
  await dbConnection();
  try {
    const {teacherid}=await req.json();
    console.log(teacherid);
    const teacher=await Teacher.findById(teacherid).populate({path:"divisions",model:Division});
    console.log(teacher);
  } catch (err) {
    console.error("Error in creating division", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in creating division",
      },
      { status: 500 }
    );
  }
}