import dbConnection from "@/lib/dbConnection";
import { Batch, Division, Subject } from "@/model/Division";
import { LabSlot, TimeTable } from "@/model/Timetable";
import { Slot } from "@/model/Timetable";
import { WeeklySchedule } from "@/model/Timetable";
import { DaySchedule } from "@/model/Timetable";

import { Semester } from "@/model/Division";
import mongoose from "mongoose";

import { Teacher } from "@/model/Teacher";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const division_id = url.searchParams.get("division_id");

    if (!division_id) {
      return Response.json(
        {
          success: false,
          message: "division_id is required",
        },
        { status: 400 }
      );
    }
    const division = await Division.findById(
      new mongoose.Types.ObjectId(division_id)
    )
      .populate({
        path: "semesters",
        model: Semester,
      })
      .then(async (division) => {
        await division?.populate({
          path: "semesters.time_table",
          model: TimeTable,
        });
        await division?.populate({
          path: "semesters.batch",
          model: Batch,
        });

        await division?.populate({
          path: "semesters.subjects",
          model: Subject,
        });
        await division?.populate({
          path: "semesters.subjects.teacher_id",
          model: Teacher,
        });

        await division?.populate({
          path: "semesters.time_table.week",
          model: WeeklySchedule,
        });

        await division?.populate({
          path: "semesters.time_table.week.days",
          model: DaySchedule,
        });

        await division?.populate({
          path: "semesters.time_table.week.days.slots",
          model: Slot,
        });

        await division?.populate({
          path: "semesters.time_table.week.days.slots.lab",
          model: LabSlot,
        });

        await division?.populate({
          path: "semesters.time_table.week.days.slots.lab.batch_id",
          model: Batch,
        });

        return division;
      });

    if (!division) {
      return Response.json(
        {
          success: false,
          message: "Division not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: division,
    });
  } catch (err) {
    console.error("Eroor ocuure in fetch timetable", err);
    return Response.json(
      {
        success: false,
        message: "Error ocucre in fetch time table",
      },
      { status: 500 }
    );
  }
}
