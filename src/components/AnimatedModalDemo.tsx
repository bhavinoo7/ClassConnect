"use client";
import React, { useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../components/ui/animated-modal";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";

import { io, Socket } from "socket.io-client";
import Teacher_live_table from "./Teacher_live_table";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", 
  transports: ["websocket"],
});

export function AnimatedModalDemo({ data, data1, email, teacherid }: any) {
  const {toast}=useToast();
  const [response, setResponse] = useState(false);
  let [isSession, setIsSession] = useState("");
  const [liveAttendance, setLiveAttendance] = useState([]);
  console.log("teacj", teacherid);
  console.log(data1);
  useEffect(() => {
    if (data1?.length > 0) {
      setIsSession(data1);
    }
    console.log(data1);
  }, [data1]);
  useEffect(() => {
    socket.emit("get-live-attendance", teacherid);
    socket.on("post-live-attendance", (data) => {
      console.log(data);
      setLiveAttendance(data);
    });
    socket.on("Response-done",()=>{
      setResponse(true);
    })

    return () => {
      socket.off("get-live-attendance");
    };
  }, [teacherid,response]);
  console.log(liveAttendance);
  useEffect(() => {
    socket.on("Response-done",()=>{
      setResponse(true);
    })}
    )
  const closeSession = async () => {
    console.log("close");
    const response = await axios.post("/api/close-session", {
      teacher_id: teacherid,
      division_id: data[0].division_id,
    });
    console.log(response);
    if (response.data.success) {
      console.log("success");
      toast({
        title: "Success",
        description: "Session closed successfully",
      })
    }
  };
  return (
    <div className="flex flex-row-reverse">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            View Qr code
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            Click
          </div>
        </ModalTrigger>

        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Session to{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Take Attendance
              </span>{" "}
            </h4>
            <div className="overflow-y-auto h-96">
              <div className="flex justify-center gap-4">
                <div className="flex flex-col justify-center items-start gap-4 border-2 border-black p-4 rounded-md text-xl">
                  <h1>session Name:{data ? data[0].subject : ""}</h1>
                  <hr />
                  <h1>Start-Time:{data ? data[0].start_time : ""}</h1>
                  <hr />
                  <h1>End-Time:{data ? data[0].end_time : ""}</h1>
                  <hr />
                  <h1>Division:{data ? data[0].division_name : ""}</h1>
                </div>
                <div>
                  <QRCode
                    size={200}
                    style={{ height: "255", maxWidth: "100%", width: "100%" }}
                    value={
                      "http://localhost:3000/sign-in?session_id=" +
                      isSession +
                      "&email=" +
                      email
                    }
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </div>
              <div>
                <Teacher_live_table liveAttendance={liveAttendance} />
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <button
              className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28"
              onClick={() => closeSession()}
            >
              Close Session
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}
