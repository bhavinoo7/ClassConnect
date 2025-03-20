import { id } from "date-fns/locale";
import mongoose, { Schema, Document } from "mongoose";
import { boolean, number, string } from "zod";

// Slot interface for a single time slot
export interface Slot {
  semester_id: mongoose.Schema.Types.ObjectId; // Reference to Division
  slot_number: number; // Slot number (1, 2, 3, etc.)
  start_time: string; // e.g., "09:00 AM"
  end_time: string; // e.g., "09:50 AM" or "10:50 AM" for merged slots
  subject: string; // Reference to Subject (optional for breaks)
  subject_id?: mongoose.Schema.Types.ObjectId;
  teacher?: mongoose.Schema.Types.ObjectId;
  teacher_name:string; // Reference to Teacher // Reference to Classroom/Lab
  is_lab: boolean; // True if it's a lab session
  lab?: Array<mongoose.Schema.Types.ObjectId>;
  day_name: string;
}

export interface Attendance {
  student_id: mongoose.Schema.Types.ObjectId;

  time: Date;
  date: Date;
  vote: number;
  confidence: number;
  status: string;
}

// Day interface for a single day's schedule
export interface DaySchedule {
  day_name: string;
  isholiday: boolean;
  slots: Array<mongoose.Schema.Types.ObjectId>; // Array of slots (6 slots per day, with merged slots for labs)
}

// Weekly timetable interface
export interface WeeklySchedule {
  days: Array<mongoose.Schema.Types.ObjectId>;
}

// Timetable document interface
export interface TimeTable extends Document {
  division_id: mongoose.Schema.Types.ObjectId; // Reference to Division
  mentor_id: mongoose.Schema.Types.ObjectId; // Reference to Mentor (Teacher)
  week: mongoose.Schema.Types.ObjectId; // Schedule for the week
  valid_until: Date; // Timetable expiration date
}

export interface LabSlot extends Document {
  batch_id: mongoose.Schema.Types.ObjectId;
  subject_id: mongoose.Schema.Types.ObjectId;
  teacher: mongoose.Schema.Types.ObjectId;
  teacher_name:string;
  lab_location:string;
}

const LabSlotSchema: Schema<LabSlot> = new Schema({
  batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  teacher_name:{
    type:String,
    default:null
  },
  lab_location:{
    type:String,
    default:null
  }
});
// Slot schema for a single time slot
const SlotSchema = new Schema<Slot>({
  semester_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  day_name: {
    type: String,
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default:null
  },
  slot_number: { type: Number, default:1 }, // 1 to 6
  start_time: { type: String, required: true }, // Start time of the slot
  end_time: { type: String, required: true }, // End time of the slot
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  teacher_name:{
    type:String,
    default:null
  },
  is_lab: { type: Boolean, default: false }, // Indicates if the slot is a lab session
  lab: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"LabSlot",
      default:null
    }
  ],
});

const AttendanceSchema = new Schema<Attendance>({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  date: {
    type: Date,
    default: null,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  vote: {
    type: Number,
    default: null,
  },
  confidence: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    default: "Not marked",
  },
});

// Day schema for a single day
const DayScheduleSchema = new Schema<DaySchedule>({
  slots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Slot", default: null }],
  day_name: {
    type: String,
    default: null,
  },
  isholiday: {
    type: Boolean,
    default: false,
  }, // Array of slots
});

// Weekly timetable schema
const WeeklyScheduleSchema = new Schema<WeeklySchedule>({
  days: [
    { type: mongoose.Schema.Types.ObjectId, ref: "DaySchedule", default: null },
  ],
});

// Timetable schema
const TimeTableSchema = new Schema<TimeTable>({
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeeklySchedule",
    required: true,
  },
  valid_until: { type: Date, required: true },
});

export const TimeTable =
  (mongoose.models.TimeTable as mongoose.Model<TimeTable>) ||
  mongoose.model<TimeTable>("TimeTable", TimeTableSchema);

export const Slot =
  (mongoose.models.Slot as mongoose.Model<Slot>) ||
  mongoose.model<Slot>("Slot", SlotSchema);

export const DaySchedule =
  (mongoose.models.DaySchedule as mongoose.Model<DaySchedule>) ||
  mongoose.model<DaySchedule>("DaySchedule", DayScheduleSchema);

export const WeeklySchedule =
  (mongoose.models.WeeklySchedule as mongoose.Model<WeeklySchedule>) ||
  mongoose.model<WeeklySchedule>("WeeklySchedule", WeeklyScheduleSchema);

export const LabSlot =
  (mongoose.models.LabSlot as mongoose.Model<LabSlot>) ||
  mongoose.model<LabSlot>("LabSlot", LabSlotSchema);

export const Attendance =
  (mongoose.models.Attendance as mongoose.Model<Attendance>) ||
  mongoose.model<Attendance>("Attendance", AttendanceSchema);
