import UserModel from "@/model/User";
import dbConnection from "@/lib/dbConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnection();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticate",
      },
      { status: 400 }
    );
  }
  const userId = new mongoose.Types.ObjectId(user?._id);
  try {
    const userme = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);
    if (!userme || userme.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        messages: userme[0].messages,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in aggregation and get message", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in aggregation pipelining and get message",
      },
      { status: 500 }
    );
  }
}
