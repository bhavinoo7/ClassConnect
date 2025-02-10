import React, { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { RootState } from "@/store/store";
import { AnimatedModalDemo } from "./AnimatedModalDemo";
import TeacherTable from "./TeacherTable";
import { io, Socket } from "socket.io-client";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import { sub } from "date-fns";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";
import { setEngine } from "crypto";
import { session } from "@/model/Teacher";
import { StudentAttendance } from "./StudentAttendance";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});

function convertToDate(timeString: string): Date {
  const now = new Date();
  const [time, period] = timeString.split(" "); // Split time and period (AM/PM)
  let [hours, minutes] = time.split(":").map(Number); // Split hours and minutes

  // Convert to 24-hour format
  if (period === "AM" && hours === 12) {
    hours = 0; // Midnight case
  } else if (period === "PM" && hours !== 12) {
    hours += 12; // Convert PM hour to 24-hour format
  }

  // Set the hours and minutes
  now.setHours(hours, minutes, 0, 0);
  return now;
}
interface TeacherDashboardProps {
  slots: any;
  email: string;  
  teacherid: string;  
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ slots,email,teacherid }) => {
  const { toast } = useToast();
  const [batch_id,setbatch_id]=useState("");
  let [live, setlive] = useState(false);
  const [liveSlots, setLiveSlots] = useState<any[]>([]);
  const [otherSlots, setOtherSlots] = useState<any[]>([]);
  const [create, setcreate] = useState(false);
  const [show, setshow] = useState(false);
  const { id } = useSelector((state:RootState) => state.user);
  const [session_id,setsession_id]=useState("");
  console.log(session_id);
  console.log(live);
  console.log(create);
  console.log(show);

  function setSlots() {
    const now = new Date(); // Current time
    let liveslot: any[] = [];
    let otherslot: any[] = [];

    slots?.forEach((slot: any) => {
      const slotStartTime = convertToDate(slot.start_time); // Convert string to Date object
      const slotEndTime = convertToDate(slot.end_time);
      console.log(slotStartTime); // Convert string to Date object
      console.log(now);
      console.log(slotEndTime);

  
      // Compare times to filter live and other slots
      if (slotStartTime <= now && slotEndTime >= now) {
        console.log("live");
        liveslot.push(slot); // Live slot
        setlive(true);
      } else if (slotEndTime < now) {
        slot.status = "completed";
        otherslot.push(slot); // Other slot (past or future)
      } else {
        slot.status = "pending";
        otherslot.push(slot); // Other slot (past or future)
      }
    });
    setLiveSlots(liveslot); // Update live slots
    setOtherSlots(otherslot);
  }
  console.log(slots);
  useEffect(() => {
    setSlots();
    console.log(liveSlots);
    console.log(otherSlots); // Call to populate live and other slots on component load
  }, [slots]);

  useEffect(() => {
    console.log("addd", id);
    if (liveSlots.length > 0) {
      socket.emit("get-session", { id });
      socket.on("get-session", ({ data }) => {
        console.log("AAAAA", data);
        setsession_id(data);
        setshow(true);
        
      });
      socket.on("session-not-found",()=>{
        setshow(false);
      })
    }
    return () => {
      socket.off("get-session");
    };
  }, [id,liveSlots,create]);

  const createSession = () => {
    const start_time = liveSlots[0].start_time;
    const end_time = liveSlots[0].end_time;
    const subject = liveSlots[0].subject;
    const division_id = liveSlots[0].division_id;
    const teacher_id = liveSlots[0].teacher;
    const is_lab = liveSlots[0].is_lab; 
    
    if(is_lab)
    {
      setbatch_id(liveSlots[0].labs[0].batch_id)
    }
    let location = "";
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude, "Longitude:", longitude);
          location = `${latitude},${longitude}`;
          console.log(location);
          const formData = {
            start_time,
            end_time,
            subject,
            division_id,
            teacher_id,
            location,
            is_lab,
            batch_id
          };
          console.log(formData);
          try {
            const response = await axios.post<ApiResponse>(
              "/api/create-session",
              formData
            );
            console.log(response);
            toast({
              title: "Success",
              description: response.data.message,
            });
            setcreate(true);
          } catch (err) {
            console.log(err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.log(
        "Geolocation is not supported or not running in the browser."
      );
    }
    console.log(location);
  };

  return (
    <div>
      {live ? (
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
                    <TableHead className="text-right">Get QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {liveSlots[0]?.subject}
                    </TableCell>
                    <TableCell>
                      {liveSlots.length > 0 ? liveSlots[0].start_time : ""} to{" "}
                      {liveSlots.length > 0 ? liveSlots[0].end_time : ""}
                    </TableCell>
                    <TableCell>
                      {slots && liveSlots.length > 0
                        ? liveSlots[0].division_name
                        : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {!show ? (
                        <Button onClick={() => createSession()}>
                          create Session
                        </Button>
                      ) : (
                        <StudentAttendance/>
                      )}
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
      <TeacherTable children={otherSlots} />
    </div>
  );
};

export default TeacherDashboard;
