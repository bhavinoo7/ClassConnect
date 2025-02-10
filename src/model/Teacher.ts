import mongoose, { Schema, Document,model,models } from "mongoose";

export interface Teacher extends Document {
  name: string;
  email: string;
  contact_no: number;
  address: string;
  subject: Array<string>;
  experience: number;
  salary: number;
  qualification: string;
  userid: mongoose.Schema.Types.ObjectId;
  ismentor: boolean;
  lectures: Array<mongoose.Schema.Types.ObjectId>;
  sessions: Array<mongoose.Schema.Types.ObjectId>;
  currentent_session: mongoose.Schema.Types.ObjectId;
  divisions: Array<mongoose.Schema.Types.ObjectId>;
}

export interface session extends Document {
  session_date: Date;
  session_name: string;
  start_time: string;
  end_time: string;
  location: string;
  radius: string;
  teacher: mongoose.Schema.Types.ObjectId;
  Attendance: Array<mongoose.Schema.Types.ObjectId>;
  status: string;
}

const TeacherSchema: Schema<Teacher> = new Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "email is required"], unique: true },
  contact_no: { type: Number, required: [true, "contact no is required"], unique: true },
  address: { type: String, required: [true, "address is required"] },
  subject: [{ type: String, required: [true, "subject is required"] }],
  experience: { type: Number, required: [true, "experience is required"] },
  salary: { type: Number, required: [true, "salary is required"] },
  qualification: { type: String, required: [true, "qualification is required"] },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  ismentor: { type: Boolean, default: false },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Slot", default: null }],
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "session", default: null }],
  currentent_session: { type: mongoose.Schema.Types.ObjectId, ref: "session", default: null },
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division", default: null }],
});

const sessionSchema: Schema<session> = new Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  session_date: { type: Date, required: true },
  session_name: { type: String, required: true },
  location: { type: String, required: true },
  radius: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  Attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: null }],
  status: { type: String, default: "open",required:true }
});

export const session = mongoose.models.session || mongoose.model<session>("session", sessionSchema);
export const Teacher = mongoose.models.Teacher || mongoose.model<Teacher>("Teacher", TeacherSchema);
