"use client";
import React, { useEffect, useState } from "react";

import { RootState } from "@/store/store";
import TeacherDashboard from "@/components/TeacherDashboard";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/hooks/hooks";
import { getDivisionSession } from "@/lib/divisionSession";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});
const Page: React.FC = () => {
  const { name, id, teacherid, email } = useAppSelector(
    (state: RootState) => state.user
  );

  console.log(email);
  console.log("Bhavin sorathiya", name);
  const divisionData = getDivisionSession();
  console.log("AAAA",divisionData);
  const [slots, setSlots] = useState<{ data?: any }>({});
  useEffect(() => {
    // Listen for responses
    socket.emit("post-teacher-data", id);
    socket.on("get-teacher-data", (data) => {
      console.log(data);
      setSlots(data);
    });

    return () => {
      socket.off("post-teacher-data");
      socket.off("get-teacher-data");
    };
  }, [id]);

  console.log(slots);
  return (
    <div>
      <TeacherDashboard
        slots={slots.data}
        email={email}
        teacherid={teacherid || ""}
      />
    </div>
  );
};

export default Page;
