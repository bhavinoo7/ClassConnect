import { createSlice } from "@reduxjs/toolkit";
import { table } from "console";
import { stat } from "fs";
import { set } from "mongoose";

const timetableslice=createSlice({
    name: "timetable",
    initialState: {
        table: [],
        division_id: "",
        sem:[],
    },
    reducers: {
        addtimetable:(state,action)=>{
            state.table=action.payload
        },
        removetimetable:(state)=>{
            state.table=[]
        },
        setdivisionid:(state,action)=>{
            state.division_id=action.payload
        },
        deletedivisionid:(state)=>{ 
            state.division_id=""
        },
        setsem:(state,action)=>{
            state.sem=action.payload
        },
        removesem:(state)=>{
            state.sem=[]
        }
    }
})

export const timeTableActions=timetableslice.actions;
export default timetableslice