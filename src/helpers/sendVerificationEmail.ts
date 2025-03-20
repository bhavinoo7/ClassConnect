import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { string } from "zod";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "noreply@dosome.me",
      to: email,
      subject: "Verification code",
      react: VerificationEmail({ username:userName, otp: verificationCode }),
    });
    
    return { success: true, message: "succefully sended verification code" };
  } catch (err) {
    console.error("Error for sending verfication code");
    return {
      success: false,
      message: "Error occure in sending verification code",
    };
  }
}


