import dbConnection from "@/lib/dbConnection";
import { Teacher } from "@/model/Teacher";
import { Slot, LabSlot } from "@/model/Timetable";
import { Division, Semester, Subject } from "@/model/Division";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const teacher_id = url.searchParams.get("teacher_id");

    const teacher = await Teacher.findById(teacher_id);
    if (!teacher) {
      return Response.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }

    const slots = teacher.lectures.map(async (lecture: any) => {
      const week = await Slot.findById(lecture)
        .populate({
          path: "lab",
          model: LabSlot,
        })
        .then(async (slot) => {
          if (!slot) return null;
          await slot.populate({
            path: "subject_id",
            model: Subject,
          });
          await slot.populate({
            path: "lab.subject_id",
            model: Subject,
          }),
            await slot.populate({
              path: "semester_id",
              model: Semester,
            });
          await slot.populate({
            path: "semester_id.division_id",
            model: Division,
          });
          return slot;
        });

      const today = new Date();
      const day = today.getDay(); // Returns a number (0-6)

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const d = days[day];
      if (week?.day_name === d) {
        return week;
      }
    });
    const b = await Promise.all(slots);

    const s: any[] = [];
    b.map((slot: any) => {
      if (slot !== undefined) {
        if (slot.is_lab) {
          slot.lab.map((lab: any) => {
            if (lab.teacher.toString() === teacher_id) {
              const obj = {
                is_lab: true,
                teacher: lab.teacher,
                lab: lab,
                subject: lab.subject_id.subject_name,
                semester: slot.semester_id._id,
                division: slot.semester_id.division_id._id,
                division_name: slot.semester_id.division_id.division_name,
                day: slot.day_name,
                start_time: slot.start_time,
                end_time: slot.end_time,
              };

              s.push(obj);
            }
          });
        } else {
          const obj = {
            is_lab: false,
            teacher: slot.teacher,
            subject: slot.subject_id.subject_name,
            semester: slot.semester_id._id,
            division: slot.semester_id.division_id._id,
            division_name: slot.semester_id.division_id.division_name,
            day: slot.day_name,
            start_time: slot.start_time,
            end_time: slot.end_time,
            subject_id: slot.subject_id._id,
          };

          s.push(obj);
        }
      }
    });

    return Response.json(
      {
        success: true,
        data: s,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Errro occure in fetch slot", err);
    return Response.json(
      {
        success: false,
        message: "Error occure in fetch slot",
      },
      { status: 500 }
    );
  }
}
