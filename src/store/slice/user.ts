import { session } from "@/model/Teacher";
import { createSlice } from "@reduxjs/toolkit";
import { LogIn } from "lucide-react";

interface userSliceSchema {
  id: string;
  name: string;
  forsession:string;
  email:string;
}

const userSlice = createSlice({
  name: "user",
  initialState: { id: "", name: "",forsession:"",email:"" } as userSliceSchema,
  reducers: {
    login: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.forsession = action.payload.session_id;
      state.email = action.payload.email;
    },
    logout: (state) => {
      state.id = "";
      state.name = "";
      state.forsession="";
      state.email="";
    },
  },
});

export const userActions = userSlice.actions;   
export default userSlice;
