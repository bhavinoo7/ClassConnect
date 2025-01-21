import dbConnection from "@/lib/dbConnection";
export async function POST(req:Request)
{
    await dbConnection()
    try{
        const {session_id,student_id,IP,image,student_location}=await req.json();
        
        console.log(
            session_id,
            student_id,
            IP,
            image,
            student_location
        );

    }catch(err)
    {
        console.error("Error occure in student attendace",err);
        Response.json({
            success:false,
            message:"Error occure in student attendace"
        },{status:500})
    }

}

