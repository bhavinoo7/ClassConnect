import mongoose, { Schema, Document } from "mongoose";

// Slot interface for a single time slot
export interface Slot {
  division_id: mongoose.Schema.Types.ObjectId; // Reference to Division
  slot_number: number; // Slot number (1, 2, 3, etc.)
  start_time: string; // e.g., "09:00 AM"
  end_time: string; // e.g., "09:50 AM" or "10:50 AM" for merged slots
  subject: string; // Reference to Subject (optional for breaks)
  teacher?: mongoose.Schema.Types.ObjectId; // Reference to Teacher // Reference to Classroom/Lab (optional for breaks)
  is_lab: boolean; // True if it's a lab session
  merged_slots?: string;
  lab?: Array<mongoose.Schema.Types.ObjectId>; 
  iscompleted:boolean;// Example: "1-2", "3-4", "5-6" for labs
}

export interface Attendance {
  student_id: mongoose.Schema.Types.ObjectId;
  IP: string;
  date: Date;
  location: string;
  distance: number;
  image: string;
  status: string;
}

// Day interface for a single day's schedule
export interface DaySchedule {
  slots: Array<mongoose.Schema.Types.ObjectId>; // Array of slots (6 slots per day, with merged slots for labs)
}

// Weekly timetable interface
export interface WeeklySchedule {
  days: {
    Monday: Array<mongoose.Schema.Types.ObjectId>;
    Tuesday: Array<mongoose.Schema.Types.ObjectId>;
    Wednesday: Array<mongoose.Schema.Types.ObjectId>;
    Thursday: Array<mongoose.Schema.Types.ObjectId>;
    Friday: Array<mongoose.Schema.Types.ObjectId>;
    Saturday: Array<mongoose.Schema.Types.ObjectId>;
  };
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
  subject: string;
  teacher: mongoose.Schema.Types.ObjectId;
}

const LabSlotSchema: Schema<LabSlot> = new Schema({
  batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
});
// Slot schema for a single time slot
const SlotSchema = new Schema<Slot>({
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  slot_number: { type: Number, required: true }, // 1 to 6
  start_time: { type: String, required: true }, // Start time of the slot
  end_time: { type: String, required: true }, // End time of the slot
  subject: { type: String, required: true }, // Optional for free slots
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  is_lab: { type: Boolean, default: false }, // Indicates if the slot is a lab session
  merged_slots: { type: String },
  lab: [LabSlotSchema],
  iscompleted:{type:Boolean,default:false}
  // Example: "1-2", "3-4", "5-6"
});

const AttendanceSchema = new Schema<Attendance>({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  IP: {
    type: String,
    default:null
  },
  date: {
    type: Date,
   
    default:null
  },
  location: {
    type: String,
    
    default:null
  },
  distance: {
    type: Number,
   
    default:null
  },
  image: {
    type: String,
    
    default:null
  },
  status: {
    type: String,
    default: "Not marked",
    
  },
});

// Day schema for a single day
const DayScheduleSchema = new Schema<DaySchedule>({
  slots: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  ], // Array of slots
});

// Weekly timetable schema
const WeeklyScheduleSchema = new Schema<WeeklySchedule>({
  days: {
    Monday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
    Tuesday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
    Wednesday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
    Thursday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
    Friday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
    Saturday: { type: mongoose.Schema.Types.ObjectId,ref:"DaySchedule",required: true },
  },
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
  week: { type: mongoose.Schema.Types.ObjectId,ref:"WeeklySchedule", required: true },
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
