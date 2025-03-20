import mongoose, { Schema, Document } from "mongoose";

export interface Student extends Document {
  name: string;
  email: string;
  contact_no: number;
  address: string;
  branch_name: mongoose.Schema.Types.ObjectId;
  division: mongoose.Schema.Types.ObjectId;
  enroll_no: string;
  dob: Date;
  gender: string;
  userid: mongoose.Schema.Types.ObjectId;
  report: Array<mongoose.Schema.Types.ObjectId>;
  ismodel: boolean;
  notification: Array<mongoose.Schema.Types.ObjectId>;  

}

export interface StudentReport extends Document {
  student_id: mongoose.Schema.Types.ObjectId;
  total_sessions: number;
  present_sessions: number;
  absent_sessions: number;
  percentage: number;
  subjects: Array<{
    subject_id: mongoose.Schema.Types.ObjectId;
    subject_name: string;
    total_sessions: number;
    attendance: Array<mongoose.Schema.Types.ObjectId>;
    present_sessions: number;
    absent_sessions: number;
    percentage: number;
  }>;
}

const StudentSchema: Schema<Student> = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  contact_no: {
    type: Number,
    required: [true, "contact no is required"],
    unique: true,
  },
  ismodel: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: [true, "address is required"],
  },
  branch_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  enroll_no: {
    type: String,
    required: [true, "enroll_no is required"],
    unique: true,
  },
  dob: {
    type: Date,
    required: [true, "dob is required"],
  },
  gender: {
    type: String,
    default: "Male",
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  report: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reports",
      default: null,
    },
  ],
  notification:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Notification",
      default:null
    }
  ]
});

export const studentReportSchema: Schema<StudentReport> = new Schema({
student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  total_sessions: {
    type: Number,
    default: 0,
  },
  present_sessions: {
    type: Number,
    default: 0,
  },
  absent_sessions: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  subjects: [
    {
      subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      subject_name: {
        type: String,
        required: true,
      },
      attendance: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attendance",
          default: null,
        },
      ],
      total_sessions: {
        type: Number,
        default: 0,
      },
      present_sessions: {
        type: Number,
        default: 0,
      },
      absent_sessions: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
  ],
});

const Student =
  (mongoose.models.Student as mongoose.Model<Student>) ||
  mongoose.model<Student>("Student", StudentSchema);

export const StudentReport =
  (mongoose.models.StudentReport as mongoose.Model<StudentReport>) ||
  mongoose.model<StudentReport>("StudentReport", studentReportSchema);

export default Student;
