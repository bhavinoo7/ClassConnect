import React, { useEffect, useState } from "react";
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
import { Button } from "./ui/button";

import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "./ui/progress";
import { StudentAttendance } from "./StudentAttendance";
import TeacherTable from "./TeacherTable";
import { Loader2 } from "lucide-react";


function convertToDate(timeString: string): Date {
  const now = new Date();
  const [time, period] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "AM" && hours === 12) hours = 0;
  else if (period === "PM" && hours !== 12) hours += 12;

  now.setHours(hours, minutes, 0, 0);
  return now;
}

const TeacherDashboard = () => {
  const { toast } = useToast();
  const [batch_id, setbatch_id] = useState("");
  const [live, setlive] = useState(false);
  const [liveSlots, setLiveSlots] = useState<any[]>([]);
  const [otherSlots, setOtherSlots] = useState<any[]>([]);
  const [create, setcreate] = useState(false);
  const [show, setshow] = useState(false);
  const [session_id, setsession_id] = useState("");

  const {  teacherid } = useSelector((state: RootState) => state.user);
  const [slots, setSlots] = useState<any[]>([]);
 

  // Fetching slots data
  const { data, isLoading } = useQuery({
    queryKey: ["timetable"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/fetch-slots?teacher_id=${teacherid}`
      );
      setSlots(response.data.data); // Updating state after fetching
      return response.data;
    },
  });

  

  // Function to categorize slots
  function processSlots(slots: any[]) {
    const now = new Date();
    let liveslot: any[] = [];
    let otherslot: any[] = [];

    slots?.forEach((slot: any) => {
      const slotStartTime = convertToDate(slot.start_time);
      const slotEndTime = convertToDate(slot.end_time);

      if (slotStartTime <= now && slotEndTime >= now) {
        liveslot.push(slot);
      } else {
        slot.status = slotEndTime < now ? "completed" : "pending";
        otherslot.push(slot);
      }
    });

    return { liveslot, otherslot };
  }

  // Effect to update live and other slots when `slots` change
  useEffect(() => {
    const { liveslot, otherslot } = processSlots(slots);
    setLiveSlots(liveslot);
    setOtherSlots(otherslot);
    setlive(liveslot.length > 0);
  }, [slots]);

  // Effect to handle socket events when live slots exist
  useEffect(() => {
    async function fetch() {
      const response = await axios.get(
        "/api/get-session?teacher_id=" + teacherid
      );
      if (response.data.success) {
        setsession_id(response.data.data);
        setshow(true);
      } else {
        setshow(false);
      }
    }
    if (liveSlots.length > 0) {
      fetch();
    }
  }, [create,liveSlots,teacherid]);

  const createSession = async () => {
    if (!liveSlots.length) return;

    const {
      start_time,
      end_time,
      subject,
      division,
      semester,
      teacher,
      is_lab,
      subject_id,
      lab,
    } = liveSlots[0];

    let location = "";

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          location = `${position.coords.latitude},${position.coords.longitude}`;

          const formData = {
            start_time,
            end_time,
            subject,
            division,
            semester,
            lab,
            teacher_id: teacher,
            location,
            is_lab,
            subject_id,
          };

          try {
            const response = await axios.post("/api/create-session", formData);
            toast({ title: "Success", description: response.data.message });
            setcreate(true);
          } catch (err) {
            console.error(err);
          }
        },
        (error) => console.error("Geolocation error:", error)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="mr-2 h-11 w-11 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {live && (
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
                    <TableHead>Session Name</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {liveSlots[0]?.subject}
                    </TableCell>
                    <TableCell className="font-medium">
                      {liveSlots[0]?.is_lab ? "Lab" : "Lecture"}
                    </TableCell>
                    <TableCell>
                      {liveSlots.length > 0
                        ? `${liveSlots[0].start_time} to ${liveSlots[0].end_time}`
                        : ""}
                    </TableCell>
                    <TableCell>
                      {slots && liveSlots.length > 0
                        ? liveSlots[0].division_name
                        : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {!show ? (
                        <Button onClick={createSession}>Create Session</Button>
                      ) : (
                        <StudentAttendance session_id={session_id} />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
      <TeacherTable children={otherSlots} />
    </div>
  );
};

export default TeacherDashboard;
