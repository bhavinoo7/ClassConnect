import mongoose, { Schema, Document } from "mongoose";
import { gender, division } from "../types/ApiResponse";
import { ST } from "next/dist/shared/lib/utils";
import exp from "constants";
export interface Student extends Document {
  name: string;
  email: string;
  contact_no: number;
  address: string;
  branch_name: string;
  division: division;
  enroll_no: string;
  dob: Date;
  gender: gender;
  userid: mongoose.Schema.Types.ObjectId;
  lectures: Array<mongoose.Schema.Types.ObjectId>;
  sessions: Array<mongoose.Schema.Types.ObjectId>;  
}

export interface StudentSession extends Document {
  session_id: mongoose.Schema.Types.ObjectId;
  date: Date;
  time: string;
  distance:string;
  student_location: string;
  image: string;
  IP: string;
  student_id: mongoose.Schema.Types.ObjectId;
  status: string; 
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
  address: {
    type: String,
    required: [true, "address is required"],
  },
  branch_name: {
    type: String,
    required: [true, "branch_name is required"],
  },
  division: {
    type: String,
    enum: Object.values(division),
    default: division.A,
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
    enum: Object.values(gender),
    default: gender.Male,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      default:null
    },
  ],
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentSession",
      default:null
    },
  ],
});

export const StudentSessionSchema: Schema<StudentSession> = new Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "session",
    required: true,
  },
  date: {
    type: Date,
    required: [true, "date is required"],
  },
  time: {
    type: String,
    required: [true, "time is required"],
  },
  distance: {
    type: String,
    required: [true, "distance is required"],
  },
  student_location: {
    type: String,
    required: [true, "student_location is required"],
  },
  image: {
    type: String,
    required: [true, "image is required"],
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  IP: {
    type: String,
    required: [true, "IP is required"],
  },
  status: { 
    type: String, 
    default: "Not marked" 
  },
});

const Student =
  (mongoose.models.Student as mongoose.Model<Student>) ||
  mongoose.model<Student>("Student", StudentSchema);

export const StudentSession =
  (mongoose.models.StudentSession as mongoose.Model<StudentSession>) ||
  mongoose.model<StudentSession>("StudentSession", StudentSessionSchema);

export default Student;
