import { MotionGlobalConfig } from "framer-motion";
import mongoose from "mongoose";

export interface Department extends mongoose.Document {
  department_name: string;
  department_code: string;
  divisions: Array<mongoose.Schema.Types.ObjectId>;
  teachers: Array<mongoose.Schema.Types.ObjectId>;
  HeadOfDepartment: mongoose.Schema.Types.ObjectId;
}

const DepartmentSchema: mongoose.Schema<Department> = new mongoose.Schema({
  department_name: {
    type: String,
  },
  department_code: {
    type: String,
    required: [true, "Department Code is required"],
  },
  divisions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      default: null,
    },
  ],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  ],
  HeadOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hod",
    default: null,
  },
});

export interface Hod extends mongoose.Document {
  name: string;
  email: string;
  contact_no: number;
  department: mongoose.Schema.Types.ObjectId;
  techer_id: mongoose.Schema.Types.ObjectId;
  userid: mongoose.Schema.Types.ObjectId;
  division: Array<mongoose.Schema.Types.ObjectId>;
  notification: Array<mongoose.Schema.Types.ObjectId>;
  sendNotification: Array<mongoose.Schema.Types.ObjectId>;
}

export const HodSchema: mongoose.Schema<Hod> = new mongoose.Schema({
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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  division: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      default: null,
    },
  ],
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: null,
    },
  ],
  sendNotification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sendNotification",
      default: null,
    },
  ],
});

export const Department =
  mongoose.models.Department ||
  mongoose.model<Department>("Department", DepartmentSchema);
export const Hod = mongoose.models.Hod || mongoose.model<Hod>("Hod", HodSchema);
