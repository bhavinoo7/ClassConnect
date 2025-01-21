import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isverfied?: boolean;
    userName?: string;
    usertype?: string;
    formfilled?: boolean;
    image?: string;
    email?: string;
    session_id?: string;
    qemail?: string;
    studentid?: string; 
    teacherid?: string;
  }
  interface Session {
    user: {
      _id?: string;
      isverfied?: boolean;
      image?: string;
      formfilled?: boolean;
      userName?: string;
      usertype?: string;
      email?: string; 
      session_id?: string;
      qemail?: string;
      studentid?: string;
      teacherid?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isverfied?: boolean;
    image?: string;
    formfilled?: boolean;
    userName?: string;
    usertype?: string;
    email?: string;
    session_id?: string;
    qemail?: string; 
    studentid?: string; 
    teacherid?: string;
  }
}
