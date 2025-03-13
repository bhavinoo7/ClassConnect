import { resend } from "../lib/resend";
import DivisionCredential from "emails/DivisionCredential";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendAccessCredential(
  email: string,
  userName: string,
  id:string,
  password:string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "noreply@dosome.me",
      to: email,
      subject: "Division Access Credential",
      react:DivisionCredential({username:userName,id,password})
    });
    console.log(error);
    console.log(data);
    return { success: true, message: "succefully sended access credential code" };
  } catch (err) {
    console.error("Error for sending access credential",err);
    return {
      success: false,
      message: "Error occure in sending access credential",
    };
  }
}


