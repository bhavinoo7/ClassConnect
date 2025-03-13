import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { TimeTable } from "@/model/Timetable";
import { Slot } from "@/model/Timetable";
import { WeeklySchedule } from "@/model/Timetable";
import { DaySchedule } from "@/model/Timetable";
import { Batch } from "@/model/Division";
import { Semester } from "@/model/Division";

export async function GET(){
    await dbConnection()
    try{

    }catch(err)
    {
        console.error("Eroor ocuure in fetch timetable",err)
        return Response.json({
            success:false,
            message:"Error ocucre in fetch time table"
        },{status:500})
    }
}