import { session } from "@/model/Teacher";
import { createSlice } from "@reduxjs/toolkit";
import { LogIn } from "lucide-react";

interface userSliceSchema {
  id: string;
  name: string;
  userType?: string;
  email:string;
  studentid?: string;
  teacherid?: string;
  hodid?: string;
}

const userSlice = createSlice({
  name: "user",
  initialState: { id: "", name: "",forsession:"",email:"",studentid:"",teacherid:"",hodid:"" } as userSliceSchema,
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
    logout: (state) => {
      state.id = "";
      state.name = "";
      state.userType="";
      state.email="";
      state.studentid="";
      state.teacherid="";
      state.hodid="";
    },
  },
});

export const userActions = userSlice.actions;   
export default userSlice;
