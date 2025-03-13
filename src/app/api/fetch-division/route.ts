import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Teacher } from "@/model/Teacher";
import { da } from "date-fns/locale";
import mongoose from "mongoose";
export async function POST(req: Request) {
  await dbConnection();
  try {
    const teacherid=await req.text();
    console.log(teacherid);
    const teacherObjectId = new mongoose.Types.ObjectId(teacherid);
      const result = await Teacher.aggregate([
        { $match: { _id: teacherObjectId } }, // Match teacher by ID
        { 
            $lookup: {
                from: "divisions",  // Collection name in MongoDB
                localField: "divisions",
                foreignField: "_id",
                as: "divisions"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1, // Optional: include teacher name
                divisions: {
                    $map: {
                        input: "$divisions",
                        as: "division",
                        in: {
                            division_id: "$$division._id",
                            division_code: "$$division.division_code"
                        }
                    }
                }
            }
        }
    ]);
    console.log(result[0].divisions);
    const teacher=await Teacher.findById(teacherObjectId);
    if(teacher.mentor.ismentor===true)
    {
    return Response.json({ success: true, data: result[0].divisions,message:"ismentor" });
    }
    return Response.json({success:true,data:result[0].divisions,message:"not mentor"});
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