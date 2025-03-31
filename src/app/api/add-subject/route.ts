import dbConnection from "@/lib/dbConnection";
import { Division, Semester, Subject } from "@/model/Division";
import { Teacher } from "@/model/Teacher";
import mongoose from "mongoose";
export async function POST(req:Request) {
    await dbConnection();
    try{
        const data=await req.json();
        console.log(data);
        const sub=new Subject({
            subject_name:data.name,
            subject_code:data.code,
            teacher_id:data.teacher,
        })
        console.log(sub);
        await sub.save();

        const teacher=await Teacher.findById(data.teacher);
        if(!teacher)
        {
            return Response.json({
                success:false,
                message:"Teacher not found"
            })
        }
        teacher.subject.push(sub._id);
        await teacher.save();
        console.log(teacher);
        
        const division=await Division.findById(data.division_id);

        if(!division)
        {
            return Response.json({
                success:false,
                message:"Division not found"
            })
        }

        const sem=await Semester.findById(division?.current_semester);

        if(!sem)
        {
            return Response.json({
                success:false,
                message:"Semester not found"
            })
        }


        
        sem?.subjects.push(sub?._id as mongoose.Schema.Types.ObjectId);
        await sem.save();
        
        console.log(sem);
        return Response.json({
            success:true,
            message:"Subject added successfully",
        })
    }catch(err)
    {
        console.log("Erorr occure in add subject");
        return Response.json({
            success:false,
            message:"Error occure in add subject"
        })
    }
    
}