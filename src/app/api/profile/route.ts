import dbConnection from "@/lib/dbConnection";
import Student from "@/model/Student";
import { Division } from "@/model/Division";
import mongoose from "mongoose";

import UserModel from "@/model/User";

export async function GET(req: Request) {
  await dbConnection();
  try {
    const url = new URL(req.url);
    const student_id = url.searchParams.get("student_id");

    if (!student_id) {
      return Response.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await Student.findById(
      new mongoose.Types.ObjectId(student_id)
    );
    const div = await Division.findById(student?.division);

    const user = await UserModel.findById(student?.userid);

    if (!student) {
      return Response.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const obj = {
      enrollmentNumber: student.enroll_no,

      name: student.name,
      email: student.email,

      phone: `+91 ${student.contact_no}`,
      department: div?.division_name,
      division: div?.division_code,

      dob: formatDate(student.dob),
      gender: student.gender,
      address: student.address,
      bio: "Computer Science student with a passion for web development and artificial intelligence. Active member of the coding club and volunteer tutor.",
      avatar: user?.image,
    };

    return Response.json({ success: true, data: obj }, { status: 200 });
  } catch (err) {
    console.error("Error occurred in profile fetch", err);
    return Response.json(
      { success: false, message: "Error occurred in profile fetch" },
      { status: 500 }
    );
  }
}

function formatDate(isoString: any) {
  const date = new Date(isoString);
  const options = {
    month: "long" as "long" | "numeric" | "2-digit" | "short" | "narrow",
    day: "numeric" as "numeric" | "2-digit",
    year: "numeric" as "numeric" | "2-digit",
  };

  let formattedDate = date.toLocaleDateString("en-US", options);

  // Add ordinal suffix (st, nd, rd, th)
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return formattedDate.replace(/\d+/, `${day}${suffix}`);
}
