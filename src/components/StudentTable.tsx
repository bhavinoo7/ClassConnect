import React, { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Socket,io } from "socket.io-client";
  const socket: Socket = io("http://localhost:3000", {
    path: "/api/socket", // Match the path defined in the server
    transports: ["websocket"], // Ensure WebSocket is used
  });
  import { v4 as uuidv4 } from 'uuid';
const StudentTable = ({studentSessions}:any) => {
  console.log(studentSessions); 
  const [studentTable,setStudentTable]=useState([]);
  useEffect(() => {
    if(studentSessions!==null){
    socket.emit("fetch-student-sessions",studentSessions);
    socket.on("fetch-student-sessions", (data) => {
      console.log(data);
      setStudentTable(data);
    }
    )}
  }, [studentSessions]);
  return (
    <>
    <Table>
  <TableCaption>A list of your</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Session Name</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Time</TableHead>
      <TableHead >IP</TableHead>
      <TableHead >distance</TableHead>
      <TableHead >Status</TableHead>
      <TableHead>Image</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
   
      {studentTable.map((session:any)=>(
        <TableRow key={uuidv4()}>
        <TableCell className="font-medium">{session.session_name}</TableCell>
        <TableCell>{session.date}</TableCell>
        <TableCell>{session.time}</TableCell>
        <TableCell>{session.IP}</TableCell>
        <TableCell>{session.distance}</TableCell>
        <TableCell>{session.status}</TableCell>
        <TableCell className='text-right'><img src={session.image} alt="session" width={200} /></TableCell>
        </TableRow>
      ))}
    
      
    
    
  </TableBody>
</Table>
</>
   
  )
}

export default StudentTable
