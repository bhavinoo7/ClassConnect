import dbConnection from "@/lib/dbConnection";
import { Division } from "@/model/Division";
import { Hod } from "@/model/Hod";
import { Teacher } from "@/model/Teacher";  
import { Department } from "@/model/Hod"; // Fixed import

interface RequestBody {
    divisionName: string;
    divisionCode: string;
    mentors: string[]; // Array of mentor IDs (assuming they are strings)
    hodid: string; // Assuming `hodid` is a string
}

export async function POST(req: Request) {
    await dbConnection();
    
    try {
        const { divisionName, divisionCode, mentors, hodid }: RequestBody = await req.json();
        
        console.log(mentors);
        
        const hod = await Hod.findById(hodid);
        if (!hod) {
            return Response.json({ success: false, message: "HOD not found" }, { status: 404 });
        }

        console.log(hod);

        const division = new Division({
            division_name: divisionName,
            division_code: divisionCode,
            mentor: mentors,
            hodid: hodid,
            department: hod.department
        });

        await division.save();
        console.log(division);

        // Iterate over mentors and update their data
        for (const mentorId of mentors) {
            const teacher = await Teacher.findById(mentorId);
            if (teacher) {
                teacher.ismentor = true;
                teacher.divisions.push(division._id);
                await teacher.save();
            }
        }

        hod.division.push(division._id);
        await hod.save(); // Make sure to save the updated HOD data

        const department = await Department.findById(hod.department);
        if (department) {
            department.divisions.push(division._id);
            console.log(department);
            await department.save();
        }

        return Response.json({
            success: true,
            message: "Division added successfully"
        });

    } catch (err) {
        console.error("Error occurred in add division:", err);
        return Response.json(
            {
                success: false,
                message: "Error occurred in adding division"
            },
            { status: 500 }
        );
    }
}
