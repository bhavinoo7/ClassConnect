import dbConnection from "@/lib/dbConnection";

import { Department } from "@/model/Hod";

export async function GET(req: Request) {
  await dbConnection();
  try{
  const departments = await Department.find({});
  
  const depart=departments.map((d)=>{
    return {name:d.department_name,id:d._id}
  })
  
  return Response.json({
    success:true,
    data:depart
  })
}catch(err)
{
    console.error("Error occure in Fetch Department",err)
    return Response.json({
        success:false,
        message:"Error occure in Fetch Department"
    },{status:500})
}
}
