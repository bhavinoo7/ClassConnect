import dbConnection from "@/lib/dbConnection";
import { LabSlot, Slot } from "@/model/Timetable";
import { DaySchedule, WeeklySchedule } from "@/model/Timetable";
import { Subject } from "@/model/Division";
import { Teacher } from "@/model/Teacher";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnection();
  try {
    const data = await req.json();

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (!days.includes(data.day)) {
      return Response.json({
        success: false,
        message: "This day entry not found",
      });
    }
    const week = await WeeklySchedule.findById(
      new mongoose.Types.ObjectId(data.week_id)
    ).populate<{ days: DaySchedule }>("days");

    let slot: mongoose.Document<unknown, {}, Slot> &
      Slot & { _id: mongoose.Types.ObjectId } & { __v: number };
    if (data.classType == "lecture") {
      const subject = await Subject.findById(data.subjectId).populate<{
        teacher_id: Teacher;
      }>("teacher_id");
      if (!subject) {
        throw new Error("Subject not found");
      }

      const teach = await Teacher.findById(subject.teacher_id._id);

      slot = new Slot({
        start_time: convertTo12HourFormat(data.startTime.toString()),
        end_time: convertTo12HourFormat(data.endTime.toString()),
        day_name: data.day,
        teacher: subject?.teacher_id._id,
        teacher_name: subject?.teacher_id.name,
        subject_id: data.subjectId,
        semester_id: data.semesterId,
      });
      teach.lectures.push(slot._id);
      await teach.save();

      await slot.save();
    } else if (data.classType == "lab") {
      let batch: any[] = [];

      slot = new Slot({
        start_time: convertTo12HourFormat(data.startTime.toString()),
        end_time: convertTo12HourFormat(data.endTime.toString()),
        semester_id: data.semesterId,
        day_name: data.day,
        is_lab: true,
      });

      // Use Promise.all to wait for all database queries
      const batchPromises = data.batches.map(async (b: any) => {
        const subject = await Subject.findById(
          new mongoose.Types.ObjectId(b.subjectId)
        ).populate<{
          teacher_id: Teacher;
        }>("teacher_id");

        const teach = await Teacher.findById(subject?.teacher_id._id);

        teach.lectures.push(slot?._id);
        await teach.save();

        if (!subject) {
          throw new Error("Subject not found");
        }

        const lab = new LabSlot({
          batch_id: b.id,
          subject_id: b.subjectId,
          teacher: subject.teacher_id?._id, // Ensure teacher_id exists
          teacher_name: subject.teacher_id?.name,
          lab_location: b.location,
        });

        await lab.save(); // Ensure it's saved before pushing

        return lab._id; // Return the ID after saving
      });

      batch = await Promise.all(batchPromises); // Wait for all async operations

      slot.lab = batch;

      await slot.save();
    } else {
      return Response.json(
        {
          success: false,
          message: "Wrong class type",
        },
        { status: 500 }
      );
    }
    for (const d of Array.isArray(week?.days) ? week.days : []) {
      if (d.day_name == data.day) {
        const de = await DaySchedule.findById(d._id);

        de?.slots.push(slot?._id as any);

        await de?.save();
        return Response.json(
          {
            success: true,
            message: "Slot added successfully",
          },
          { status: 200 }
        );
      }
    }

    const de = new DaySchedule({
      day_name: data.day,
    });
    de.slots.push(slot?._id as any);
    const w = await WeeklySchedule.findById(data.week_id);
    w?.days.push(de._id as any);

    await de.save();
    await w?.save();

    return Response.json(
      {
        success: true,
        message: "Slot added successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Eroori ocuure in add slot", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in the add slot",
      },
      { status: 500 }
    );
  }
}

function convertTo12HourFormat(time: string | undefined) {
  if (!time) {
    console.error("Error: Received an invalid time value:", time);
    return "Invalid time"; // Return a fallback value or handle appropriately
  }

  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) {
    console.error("Error: Unable to parse time:", time);
    return "Invalid time";
  }

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 -> 12 for 12 AM

  return `${formattedHour}:${minuteStr} ${period}`;
}
