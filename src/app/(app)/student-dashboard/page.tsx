"use client";
import Student_details_form from "@/components/Student_details_form";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { WeekChart } from "@/components/WeekChart";
import { MonthChart } from "@/components/MonthChart";
import { PercentageChar } from "@/components/PercentageChar";
import StudentTable from "@/components/StudentTable";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedModalDemo } from "@/components/AnimatedModalDemo";
import { Button } from "react-day-picker";
import { StudentAttendance } from "@/components/StudentAttendance";
import { RootState } from "@/store/store";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import Email from "next-auth/providers/email";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});

const page: React.FC = () => {
  const [session, setSession] = useState(false);
  const [session_id, setsession_id] = useState("");
  const [live, setlive] = useState(false);
  const { id } = useSelector((state: RootState) => state.user);
  const [student, setStudent] = useState<any>({});
  interface SessionDetail {
    session_name: string;
    division_name: string;
    end_time: string;
    start_time: string;
    subject: string;
    // Add other properties if needed
  }
  const [sessionDetail, setSessionDetails] = useState<SessionDetail[]>([]);
  console.log(id);
  const [qemail, setqemail] = useState("");
  const [studentid, setstudentid] = useState("");
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setSession(session.user.formfilled ?? false);
        setsession_id(session.user.session_id as string);
        setqemail(session.user.qemail as string);
        setstudentid(session.user.studentid as string);
      }
    }
    fetchData();
  }, []);
  console.log(session_id);
  console.log(qemail);  
  useEffect(() => {
    if (session_id.length > 0 ) {
      console.log("aaa");
      socket.emit("get-student-session", { id: session_id,studentid:studentid });
      socket.on("get-student-session", (data) => {
        console.log("aaa");
        console.log(data);
        setSessionDetails(data);
        setlive(true);
      });
      
      
      socket.on("session-not-found",()=>{
        setlive(false);
      })
    }
  }, [session_id,socket]);
  useEffect(() => {
    socket.emit("get-student-details",{id});
    
    socket.on("get-student-details",(data)=>{
      setStudent(data);
      console.log(data);
    })},[id]);
  console.log(session_id);
  console.log(sessionDetail);
  console.log(student);
  return (
    <div>
      {session_id.length > 0 && live ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8 bg-gray-200 m-4">
          <div className="h-50 md:h-48 rounded-lg bg-white col-span-4">
            <div className="flex items-center gap-2 text-sm m-3 text-green-500">
              <p className="w-2 h-2 bg-green-500 rounded-full"></p>
              <p>Live</p>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Session Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead className="text-right">Make attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {sessionDetail.length>0 ? sessionDetail[0].session_name : ""}
                    </TableCell>
                    <TableCell>
                      {sessionDetail.length>0 ? sessionDetail[0].start_time : ""} to
                      {sessionDetail.length>0 ? sessionDetail[0].end_time : ""}
                    </TableCell>
                    <TableCell>
                      
                    </TableCell>
                    <TableCell className="text-right">
                      <StudentAttendance data={id} student={student} session_id={session_id} qemail={qemail}/>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
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

export default page;
