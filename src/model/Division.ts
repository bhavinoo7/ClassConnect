import mongoose, { Schema, Document } from "mongoose";

export interface Division extends Document {
  division_name: string;
  division_code: string;
  mentor: Array<mongoose.Schema.Types.ObjectId>;
  request: Array<mongoose.Schema.Types.ObjectId>;
  timestamp: Date;
  hodid: mongoose.Schema.Types.ObjectId;
  subjects: Array<mongoose.Schema.Types.ObjectId>;
  students: Array<mongoose.Schema.Types.ObjectId>;
  department: mongoose.Schema.Types.ObjectId;
  semesters: Array<mongoose.Schema.Types.ObjectId>;
  current_semester: mongoose.Schema.Types.ObjectId;
}
export interface Semester extends Document {
  semester_name: string;
  semester_code: string;
  division_id: mongoose.Schema.Types.ObjectId;
  subjects: Array<mongoose.Schema.Types.ObjectId>;
  start_date: Date;
  end_date: Date;
  time_table: mongoose.Schema.Types.ObjectId;
  batch: Array<mongoose.Schema.Types.ObjectId>;
  techers: Array<mongoose.Schema.Types.ObjectId>;
  sreports: Array<mongoose.Schema.Types.ObjectId>;
}

export interface Subject extends Document {
  subject_name: string;
  subject_code: string;
  teacher_id: mongoose.Schema.Types.ObjectId;
  total_session: number;
  total_completed_session: number;
  attendance: Array<mongoose.Schema.Types.ObjectId>;
  timestamp: Date;
}

export interface Batch extends Document {
  batch_name: string;
  batch_code: string;
  students: Array<mongoose.Schema.Types.ObjectId>;
  division: mongoose.Schema.Types.ObjectId;
  timestamp: Date;
}

export interface DivisionAttendance extends Document {
  division_id: mongoose.Schema.Types.ObjectId;
  date: Date;
  session_id: Array<mongoose.Schema.Types.ObjectId>;
  session_name: string;
  Attendance: Array<mongoose.Schema.Types.ObjectId>;
  teacher_id: mongoose.Schema.Types.ObjectId;
}

export interface Reports extends Document {
  subject_name(subject_name: any): unknown;
  attendance: any;
  attendace: any;
  time: any;
  date: any;
  subject_id: string;
  student_id: mongoose.Schema.Types.ObjectId;
  student_name: string;
  division_id: mongoose.Schema.Types.ObjectId;
  semester: mongoose.Schema.Types.ObjectId;
  semestercomplated: boolean;
  start_date: Date;
  end_date: Date;
  report: Array<mongoose.Schema.Types.ObjectId>;
}

const BatchSchema: Schema<Batch> = new Schema({
  batch_name: {
    type: String,
    required: [true, "Batch Name is required"],
  },
  batch_code: {
    type: String,
    required: [true, "Batch Code is required"],
    unique: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  ],
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    default: null,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SemesterSchema: Schema<Semester> = new Schema({
  semester_name: {
    type: String,
    required: [true, "Semester Name is required"],
  },
  semester_code: {
    type: String,
    required: [true, "Semester Code is required"],
    unique: true,
  },
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
  ],
  start_date: {
    type: Date,
    required: true,
  },
  time_table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeTable",
    default: null,
  },
  batch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
  ],
  end_date: {
    type: Date,
    required: true,
  },
  techers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  ],
  sreports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reports",
      default: null,
    },
  ],
});

const SubjectSchema: Schema<Subject> = new Schema({
  subject_name: {
    type: String,
    required: [true, "Subject Name is required"],
  },
  subject_code: {
    type: String,
    required: [true, "Subject Code is required"],
    unique: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  total_session: {
    type: Number,
    default: 0,
  },
  total_completed_session: {
    type: Number,
    default: 0,
  },
  attendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DivisionAttendance",
      default: null,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});
const DivisionSchema: Schema<Division> = new Schema({
  division_name: {
    type: String,
    required: [true, "Division Name is required"],
  },
  division_code: {
    type: String,
    required: [true, "Division Code is required"],
    unique: true,
  },
  mentor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
      max: 3,
    },
  ],

  timestamp: {
    type: Date,
    default: Date.now,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  ],
  request: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  ],

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  semesters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },
  ],
  hodid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hod",
    default: null,
  },
  current_semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    default: null,
  },
});

const DivisionAttendanceSchema: Schema<DivisionAttendance> = new Schema({
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  session_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
  ],
  session_name: {
    type: String,
    required: true,
  },
  Attendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      default: null,
    },
  ],
});

const ReportsSchema: Schema<Reports> = new Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  student_name: {
    type: String,
    required: true,
  },
  division_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  semestercomplated: {
    type: Boolean,
    default: false,
  },
  report: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentReport",
      default: null,
    },
  ],
});

export const Division =
  (mongoose.models.Division as mongoose.Model<Division>) ||
  mongoose.model<Division>("Division", DivisionSchema);

export const Batch =
  (mongoose.models.Batch as mongoose.Model<Batch>) ||
  mongoose.model<Batch>("Batch", BatchSchema);

export const DivisionAttendance =
  (mongoose.models.DivisionAttendance as mongoose.Model<DivisionAttendance>) ||
  mongoose.model<DivisionAttendance>(
    "DivisionAttendance",
    DivisionAttendanceSchema
  );

export const Subject =
  (mongoose.models.Subject as mongoose.Model<Subject>) ||
  mongoose.model<Subject>("Subject", SubjectSchema);

export const Reports =
  (mongoose.models.Reports as mongoose.Model<Reports>) ||
  mongoose.model<Reports>("Reports", ReportsSchema);

export const Semester =
  (mongoose.models.Semester as mongoose.Model<Semester>) ||
  mongoose.model<Semester>("Semester", SemesterSchema);
