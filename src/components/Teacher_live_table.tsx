import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Socket, io } from "socket.io-client";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});
import { v4 as uuidv4 } from "uuid";
const Teacher_live_table = () => {
  
  const [liveattendance, setliveattendance] = useState([]);
  
  const [track, settrack] = useState(false);
  useEffect(() => {}, []);
  return (
    <>
      <Table>
        
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Session Name</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Student Id</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liveattendance.map((attendance: any) =>
            attendance.IP ? (
              <TableRow key={uuidv4()}>
                <TableCell className="font-medium">
                  {attendance.student_name}
                </TableCell>
                <TableCell>{attendance.student_enroll}</TableCell>
                
                <TableCell>{attendance.status}</TableCell>
                <TableCell className="text-right">
                  <img src={attendance.image} alt="session" width={200} />
                </TableCell>
              </TableRow>
            ) : null
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default Teacher_live_table;
