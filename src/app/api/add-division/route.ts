import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Hod } from "@/model/Hod";
import { Teacher } from "@/model/Teacher";
import { Department } from "@/model/Hod"; // Fixed import
import bcrypt from "bcryptjs";
import { sendAccessCredential } from "@/helpers/sendAccessCredential";

interface RequestBody {
  divisionName: string;
  divisionCode: string;
  mentors: string[]; // Array of mentor IDs (assuming they are strings)
  hodid: string; // Assuming `hodid` is a string
}

export async function POST(req: Request) {
  await dbConnection();

  try {
    const { divisionName, divisionCode, mentors, hodid }: RequestBody =
      await req.json();

    const hod = await Hod.findById(hodid);
    if (!hod) {
      return Response.json(
        { success: false, message: "HOD not found" },
        { status: 404 }
      );
    }

    const division = new Division({
      division_name: divisionName,
      division_code: divisionCode,
      mentor: mentors,
      hodid: hodid,
      department: hod.department,
    });

    await division.save();

    // Iterate over mentors and update their data
    for (const mentorId of mentors) {
      const teacher = await Teacher.findById(mentorId);
      if (teacher) {
        if (teacher.mentor.ismentor === false) {
          teacher.mentor.ismentor = true;
          let pass = generatePassword();
          const hashPassword = await bcrypt.hash(pass, 10);
          const email = teacher.email;
          const userName = teacher.name;
          const id = teacher._id.toString();
          const password = pass;
          const emailRespose = await sendAccessCredential(
            email,
            userName,
            id,
            password
          );
          teacher.mentor.password = hashPassword;
          await teacher.save();
        }
        teacher.divisions.push(division._id);
        await teacher.save();
      }
    }

    hod.division.push(division._id);
    await hod.save(); // Make sure to save the updated HOD data

    const department = await Department.findById(hod.department);
    if (department) {
      department.divisions.push(division._id);

      await department.save();
    }

    return Response.json({
      success: true,
      message: "Division added successfully",
    });
  } catch (err) {
    console.error("Error occurred in add division:", err);
    return Response.json(
      {
        success: false,
        message: "Error occurred in adding division",
      },
      { status: 500 }
    );
  }
}

function generatePassword(length = 8) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
