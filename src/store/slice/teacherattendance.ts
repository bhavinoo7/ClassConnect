import { Subject } from "@/model/Division";
import { createSlice } from "@reduxjs/toolkit";

const teacherattendanceSlice = createSlice({
  name: "teacherattendance",
    initialState: {
        Subjects: [],
    },
    reducers: {
        setTeacherAttendance: (state, action) => {
            state.Subjects = action.payload;
        },
        removeTeacherAttendance: (state) => {
           
            state.Subjects = [];
        }
    },
});

export const TeacherAttedanceActions = teacherattendanceSlice.actions;   
export default teacherattendanceSlice;
