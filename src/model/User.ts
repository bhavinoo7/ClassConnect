import { create } from "domain";
import mongoose, { Schema, Document,Types, mongo } from "mongoose";
import { EnumValues } from "zod";
import { userRole } from "@/types/ApiResponse";

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  varificationCode: string;
  verificationExpires: Date;
  isverfied: boolean;
  usertype: userRole;
  formfilled: boolean;
  image:string;
  studentid: mongoose.Schema.Types.ObjectId;
  teacherid: mongoose.Schema.Types.ObjectId;
  session_id:string;
  qemail:string;
  hodid:mongoose.Schema.Types.ObjectId;
  isdivisonmentor:boolean;
  isaccepted:boolean;
}

const UserSchema: Schema<User> = new Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  varificationCode: {
    type: String,
    required: [true, "varification code  is required"],
  },
  verificationExpires: {
    type: Date,
    required: true,
  },
  isverfied: {
    type: Boolean,
    default: false,
  },
  usertype: {
    type: String,
    enum: Object.values(userRole),
    default: userRole.Student,
  },
  formfilled: {
    type: Boolean,
    default: false,
  },
  image:{
    type:String,
    default:"https://res.cloudinary.com/durtlcmnb/image/upload/v1732848886/Healthcare_user_profile/nlrodw6knfvctcjicpuo.jpg"
  },
  studentid: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  teacherid: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher",default:null },
  hodid: { type: mongoose.Schema.Types.ObjectId, ref: "Hod",default:null },
  isaccepted:{
    type:Boolean,
    default:false
  },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
