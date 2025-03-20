import dbConnection from "@/lib/dbConnection";
import Student from "@/model/Student";
import { Notification, sendNotification } from "@/model/Notification";
import { Teacher } from "@/model/Teacher";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const data = await req.json();

    const teacher = await Teacher.findById(data.teacherid);
    if (!teacher) {
      return Response.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }

    const send = new sendNotification({
      sender: `Professor ${teacher.name}(${teacher.subjects[0]})`,
      recipient: "student",
      title: data.obj.title,
      message: data.obj.message,
      type: data.obj.type,
      source: "teacher",
      timestamp: data.obj.timestamp,
      recipients: data.obj.recipients,
    });

    teacher.sendNotification.push(send._id);

    await send.save();
    await teacher.save();

    const d = data.obj.recipients.map(async (rec: any) => {
      const student = await Student.findById(new mongoose.Types.ObjectId(rec));
      if (!student) {
        return Response.json(
          {
            success: false,
            message: "Student not found",
          },
          { status: 404 }
        );
      }
      const notification = new Notification({
        sender: `Professor ${teacher.name}(${teacher.subjects[0]})`,
        recipient: "student",
        title: data.obj.title,
        message: data.obj.message,
        type: data.obj.type,
        source: "teacher",
        timestamp: data.obj.timestamp,
        read: false,
      });
      await notification.save();
      student.notification.push(notification._id);
      await student.save();
    });

    await Promise.all(d);

    return Response.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (err) {
    console.error("Error occure in save notification", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in save notification",
      },
      { status: 500 }
    );
  }
}
