import { createSlice } from "@reduxjs/toolkit";
import { table } from "console";
import { stat } from "fs";

const timetableslice=createSlice({
    name: "timetable",
    initialState: {
        table: [],
    },
    reducers: {
        addtimetable:(state,action)=>{
            state.table=action.payload
        },
        removetimetable:(state)=>{
            state.table=[]
        }
    }
})

export const timeTableActions=timetableslice.actions;
export default timetableslice