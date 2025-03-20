import dbConnection from "@/lib/dbConnection";
import { Teacher } from "@/model/Teacher";
import { sendNotification } from "@/model/Notification";
import { Notification } from "@/model/Notification";
import Student from "@/model/Student";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacher_id = url.searchParams.get("teacher_id");
    if (!teacher_id) {
      return Response.json(
        {
          success: false,
          message: "Teacher id is required",
        },
        { status: 400 }
      );
    }
    const teacher = await Teacher.findById(teacher_id)
      .populate({
        path: "sendNotification",
        model: sendNotification,
      })
      .then(async (teacher) => {
        if (!teacher) return null;

        // Populate 'subject.attendance'
        await teacher.populate({
          path: "notification",
          model: Notification,
        });

        await teacher.populate({
          path: "sendNotification.recipients",
          model: Student,
        });

        return teacher;
      });

    const data: any[] = [];
    let unread = 0;
    teacher.sendNotification.map((noti: any) => {
      data.push({
        id: noti._id,
        sender: noti.sender,
        title: noti.title,
        message: noti.message,
        type: noti.type,
        timestamp: noti.timestamp,
        recipient: noti.recipient,
        read: true,
        source: "teacher",
        recipients: noti.recipients.map((rec: any) => {
          return rec.name;
        }),
      });
    });
    teacher.notification?.map((noti: any) => {
      data.push({
        id: noti._id,
        sender: noti.sender,
        title: noti.title,
        message: noti.message,
        type: noti.type,
        timestamp: noti.timestamp,
        recipient: noti.recipient,
        read: noti.read,
        source: noti.source,
      });
      if (!noti.read) {
        unread++;
      }
    });

    return Response.json({
      success: true,
      data: { notification: data, unread },
    });
  } catch (err) {
    console.error("Error occure in the fetch teacher notification", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in the fetch teacher notification",
      },
      { status: 500 }
    );
  }
}
