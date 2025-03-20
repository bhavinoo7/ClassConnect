import dbConnection from "@/lib/dbConnection";
import { Notification } from "@/model/Notification";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const data = await req.json();

    const noti = await Notification.findById(data.id);
    if (!noti) {
      return Response.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }
    noti.read = true;
    await noti.save();
    return Response.json(
      {
        success: true,
        message: "Notification read",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in the save notification", err);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
