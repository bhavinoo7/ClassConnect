import { session } from "@/model/Teacher";
import { createSlice } from "@reduxjs/toolkit";
import { m } from "framer-motion";
import { LogIn } from "lucide-react";
import { Reports } from "@/model/Division";
interface userSliceSchema {
  id: string;
  name: string;
  userType?: string;
  email:string;
  studentid?: string;
  teacherid?: string;
  hodid?: string;
  student?:string;
  studentname?:string;
  studentreport?:Array<Reports>
}

const userSlice = createSlice({
  name: "user",
  initialState: { id: "", name: "",forsession:"",email:"",studentid:"",teacherid:"",hodid:"",student:"",studentname:"",studentreport:[] } as userSliceSchema,
  reducers: {
    login: (state, action) => {
      if(action.payload.userType==="TEACHER"){
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.userType=action.payload.userType;
        state.email = action.payload.email;
        state.teacherid=action.payload.teacherid;
      }
      if(action.payload.userType==="STUDENT"){
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.userType=action.payload.userType;
        state.email = action.payload.email;
        state.studentid=action.payload.studentid;
      }
      if(action.payload.userType==="HOD"){
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.userType=action.payload.userType;
        state.email = action.payload.email;
        state.hodid=action.payload.hodid;
      }
    },
    mysession:(state,action)=>{
      state.student=action.payload.id;
      state.studentname=action.payload.name;
    },
    outmySession:(state)=>{
      state.student="";
      state.studentname="";
    },
    logout: (state) => {
      state.id = "";
      state.name = "";
      state.userType="";
      state.email="";
      state.studentid="";
      state.teacherid="";
      state.hodid="";
    },
    fetchreport: (state, action) => {
      state.studentreport = action.payload;
    },
    removereport:(state)=>{
      state.studentreport=[];
    }
  }
});

export const userActions = userSlice.actions;   
export default userSlice;
