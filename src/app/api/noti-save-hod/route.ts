import dbConnection from "@/lib/dbConnection";
import { Hod } from "@/model/Hod";
import { sendNotification, Notification } from "@/model/Notification";
import Student from "@/model/Student";
import { Teacher } from "@/model/Teacher";
import mongoose from "mongoose";
export async function POST(req: Request) {
  await dbConnection();
  try {
    const data = await req.json();

    const hod = await Hod.findById(data.hodid);
    if (!hod) {
      return Response.json(
        {
          success: false,
          message: "Hod not found",
        },
        { status: 404 }
      );
    }

    if (data.obj.sender == "teacher") {
      const send = new sendNotification({
        sender: `HOD ${hod.name}`,
        recipient: "student",
        title: data.obj.title,
        message: data.obj.message,
        type: data.obj.type,
        timestamp: data.obj.timestamp,
        recipients: data.obj.recipients,
      });

      await send.save();
      hod.sendNotification.push(send._id);
      await hod.save();
    } else {
      const send = new sendNotification({
        sender: `HOD ${hod.name}`,
        recipient: "teacher",
        title: data.obj.title,
        message: data.obj.message,
        type: data.obj.type,
        timestamp: data.obj.timestamp,
        trecipients: data.obj.recipients,
      });

      await send.save();
      hod.sendNotification.push(send._id);
      await hod.save();
    }

    const d = data.obj.recipients.map(async (rec: any) => {
      if (data.obj.sender == "teacher") {
        const notification = new Notification({
          sender: `HOD ${hod.name}`,
          recipient: "student",
          title: data.obj.title,
          message: data.obj.message,
          type: data.obj.type,
          source: "hod",
          timestamp: data.obj.timestamp,
          read: false,
        });
        const student = await Student.findById(
          new mongoose.Types.ObjectId(rec)
        );

        await notification.save();
        student?.notification.push(notification._id);
        await student?.save();
      } else {
        const notification = new Notification({
          sender: `HOD ${hod.name}`,
          recipient: "teacher",
          title: data.obj.title,
          message: data.obj.message,
          type: data.obj.type,
          source: "hod",
          timestamp: data.obj.timestamp,
          read: false,
        });

        await notification.save();
        const teacher = await Teacher.findById(
          new mongoose.Types.ObjectId(rec)
        );
        teacher?.notification.push(notification._id);

        await teacher?.save();
      }
    });
    await Promise.all(d);
    return Response.json(
      {
        success: true,
        message: "Notification saved successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Eroor occure in save notification of hod", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in save notification of hod",
      },
      { status: 500 }
    );
  }
}
