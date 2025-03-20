import dbConnection from "@/lib/dbConnection";
import { Hod } from "@/model/Hod";
import { sendNotification } from "@/model/Notification";
import Student from "@/model/Student";

import { Teacher } from "@/model/Teacher";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const hod_id = url.searchParams.get("hod_id");

    if (!hod_id) {
      return Response.json(
        {
          success: false,
          message: "Hod id is required",
        },
        { status: 400 }
      );
    }
    let hod = await Hod.findById(hod_id).populate({
      path: "sendNotification",
      model: sendNotification,
    });

    if (!hod) {
      return Response.json(
        {
          success: false,
          message: "HOD not found",
        },
        { status: 404 }
      );
    }

    // Populate students and mentors inside divisions
    await hod.populate({
      path: "sendNotification.recipients",
      model: Student,
    });

    await hod.populate({
      path: "sendNotification.trecipients",
      model: Teacher,
    });

    const data: any[] = [];

    hod.sendNotification.map((noti: any) => {
      if (noti.recipient === "student") {
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
      } else {
        data.push({
          id: noti._id,
          sender: noti.sender,
          title: noti.title,
          message: noti.message,
          type: noti.type,
          timestamp: noti.timestamp,
          recipient: noti.recipient,
          read: true,
          source: "hod",
          recipients: noti.trecipients.map((rec: any) => {
            return `Prof.${rec.name}`;
          }),
        });
      }
    });

    return Response.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Error occure in the fetch notification for the hod", err);
    return Response.json({
      success: false,
      message: "Error occure in the fetch notification in the hod",
    });
  }
}
