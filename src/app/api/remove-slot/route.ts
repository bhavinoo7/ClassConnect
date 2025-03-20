import { NextResponse } from 'next/server';
import dbConnection from '@/lib/dbConnection';
import { LabSlot, Slot } from '@/model/Timetable';
import { WeeklySchedule } from '@/model/Timetable';
import { DaySchedule } from '@/model/Timetable';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  await dbConnection();

  try {
    const data = await req.json();
    const week = await WeeklySchedule.findById(
      new mongoose.Types.ObjectId(data[0].week_id)
    ).populate<{ days: DaySchedule }>('days');

    if (!week) {
      return NextResponse.json(
        { success: false, message: 'Week not found' },
        { status: 404 }
      );
    }

    // Update day slots
    for (const d of Array.isArray(week.days) ? week.days : []) {
      if (d.day_name === data[0].day) {
        const da = await DaySchedule.findById(d._id);
        if (da) {
          da.slots = da.slots.filter((f) => f.toString() !== data[0].id);
          await da.save();
        }
      }
    }

    // Delete slot based on class type
    if (data[0].classType === 'lecture') {
      const result = await Slot.findByIdAndDelete(
        new mongoose.Types.ObjectId(data[0].id)
      );

      if (!result) {
        return NextResponse.json(
          { success: false, message: 'Entry not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Entry deleted successfully',
      });
    } else if (data[0].classType === 'lab') {
      const slot = await Slot.findById(new mongoose.Types.ObjectId(data[0].id));

      if (!slot) {
        return NextResponse.json(
          { success: false, message: 'Slot not found' },
          { status: 404 }
        );
      }

      // Delete all associated lab slots
      if (slot.lab) {
        await Promise.all(
          slot.lab.map(async (l) => {
            await LabSlot.findByIdAndDelete(l);
          })
        );
      }

      await slot.deleteOne();
      return NextResponse.json({
        success: true,
        message: 'Entry deleted successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid class type' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Error occurred in remove slot:', err);
    return NextResponse.json(
      { success: false, message: 'Error occurred in remove slot' },
      { status: 500 }
    );
  }
}