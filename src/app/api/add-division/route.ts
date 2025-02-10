import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Hod } from "@/model/Hod";
import { Teacher } from "@/model/Teacher";  
import { Department } from "@/model/Hod";


export async function POST(req:Request) {
    await dbConnection();
    try{
        const {divisionName,divisionCode,mentors,hodid}=await req.json();
        console.log(mentors);
        const hod=await Hod.findById(hodid);
        console.log(hod);
        const division=new Division({
            division_name:divisionName,
            division_code:divisionCode,
            mentor:mentors,
            hodid:hodid,
            department:hod.department
        });
        await division.save();
        console.log(division);
        mentors.map(async(mentor:any)=>{
            const teacher=await Teacher.findById(mentor);
            teacher.ismentor=true;
            teacher.divisions.push(division._id);
            await teacher.save();
        }
        );
        hod.division.push(division._id);
        const department=await Department.findById(hod.department);
        department.divisions.push(division._id);
        console.log(department);
        await department.save();
        return Response.json({
            success:true,
            message:"Division added successfully"
        });

    }catch(err)
    {
        console.error("Error ocuure in add division",err);  
        return Response.json(
            {
                success:false,
                message:"Error occure in add division"
            },
            {status:500}
        );
    }
    
}