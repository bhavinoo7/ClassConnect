"use client";
import { useEffect, useState } from "react";
import { WeekChart } from "@/components/WeekChart";
import { MonthChart } from "@/components/MonthChart";
import { PercentageChar } from "@/components/PercentageChar";
import StudentTable from "@/components/StudentTable";
import { useSelector } from "react-redux";

import { RootState } from "@/store/store";
import { io, Socket } from "socket.io-client";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});

const Page: React.FC = () => {
  const { id } = useSelector((state: RootState) => state.user);
  const [student, setStudent] = useState<any>({});
  
  
  console.log(id);
  
  
  useEffect(() => {
    socket.emit("get-student-details",{id});
    
    socket.on("get-student-details",(data)=>{
      setStudent(data);
      console.log(data);
    })},[id]);
  

  console.log(student);
  return (
    <div>
      
      <div className="gap-4 md:grid-cols-3 hidden md:grid m-4">
        <WeekChart division={student.division} />
        <MonthChart />
        <PercentageChar />
      </div>
      <div>
        <StudentTable studentSessions={student._id} />
      </div>
    </div>
  );
};

export default Page;
