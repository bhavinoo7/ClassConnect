import dbConnection from "@/lib/dbConnection";
import Student from "@/model/Student";

import { Notification } from "@/model/Notification";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const student_id = url.searchParams.get("student_id");
    if (!student_id) {
      return Response.json(
        {
          success: false,
          message: "Student id is required",
        },
        { status: 400 }
      );
    }
    const s = await Student.findById(student_id).populate({
      path: "notification",
      model: Notification,
    });
    if (!s) {
      return Response.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const data: any[] = [];
    let unread = 0;

    s.notification.map((n: any) => {
      data.push({
        id: n._id,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.timestamp),
        read: n.read,
        sender: n.sender,
        source: n.source,
        type: n.type,
        recipient: n.recipient,
      });
      if (!n.read) {
        unread++;
      }
    });
    return Response.json(
      {
        success: true,
        data: { notification: data, unread },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error occure in the fetch notification", err);
    return Response.json({
      success: false,
      message: "Error occure in the fetch notification",
    });
  }
}
