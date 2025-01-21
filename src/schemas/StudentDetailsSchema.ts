import { z } from "zod";

export const StudentDetailSchema = z.object({
  fullname: z
    .string()
    .min(5, { message: "Minimum Length is 5" })
    .max(20, { message: "Maximum Length is 20" }),
  enroll_no: z
    .string()
    .min(5, { message: "Minimum Length is 5" })
    .max(20, { message: "Maximum Length is 20" }),
  dob: z.date(),
  branch_name: z.enum([
    "Computer Engineering",
    "Information Technology",
    "Civil Engineering",
    "Electric Engineering",
    "Mechanical Engineering",
    "Not Selected",
  ]),
  contact_no: z
    .string()
    .min(10, { message: "Minimum Length is 10" })
    .max(10, { message: "Maximum Length is 10" }),
  divison: z.enum(["A", "B", "C", "D"]),
  gender: z.enum(["Male", "Female"]),
  address: z
    .string()
    .min(5, { message: "Minimum Length is 5" })
    .max(30, { message: "Maximum Length is 30" }),
});
