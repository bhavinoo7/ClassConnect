"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import TeacherDashboard from "@/components/TeacherDashboard";
import { io, Socket } from "socket.io-client";
import { any } from "zod";
import { getSession } from "next-auth/react";
import { emit } from "process";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});
const page: React.FC = () => {
  const [email, setemail] = useState("");
  const [teacherid,setteacherid]=useState("");   
  useEffect(() => {

      async function fetchData() {
        const session = await getSession();
        if (session) {
          setemail(session.user.email as string); 
          setteacherid(session.user.teacherid as string);
        }
      }
      fetchData();
    }, []);
  const { id } = useSelector((state: RootState) => state.user);

 console.log(email);
  console.log(id);
 
  const [slots, setSlots] = useState<{ data?: any }>({});
  useEffect(() => {
    // Listen for responses
    socket.emit("post-teacher-data",id);
    socket.on("get-teacher-data", (data) => {  
      console.log(data);
      setSlots(data);
    } 
    
  )

    return () => {
      socket.off('post-teacher-data');
     socket.off('get-teacher-data');
    };
  }, [id]);
  
console.log(slots);
  return (
    <div>
      <TeacherDashboard slots={slots.data} email={email} teacherid={teacherid}/>
    </div>
  );
};

export default page;
