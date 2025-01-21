"use client";
import React, { use, useEffect, useRef } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "./ui/animated-modal";
import { LabelInputContainer, BottomGradient } from "./Student_details_form";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import TimePicker from "react-time-picker";
import { useState } from "react";
import QRCode from "react-qr-code";
import { Loader2, PhoneMissed } from "lucide-react";
import { Button } from "./ui/button";
import TeacherTable from "./TeacherTable";
import StudentTable from "./StudentTable";
import axios from "axios";
import { session } from "@/model/Teacher";
import { ApiResponse } from "@/types/ApiResponse";
import { Socket,io } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
const socket: Socket = io("http://localhost:3000", {
  path: "/api/socket", // Match the path defined in the server
  transports: ["websocket"], // Ensure WebSocket is used
});

export function StudentAttendance({ data, student,session_id,qemail }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [image, setImage] = useState({ contentType: "", data: "" });
  const [photoData, setPhotoData] = useState("");
  const [submitting,setSubmitting]=useState(false);
  const [enable,setenable]=useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(false);
  const {toast}=useToast();
  console.log("student", student);
  console.log("bhavin", data);
  console.log(image);
  console.log(photoData);
  let [isSession, setIsSession] = useState("");
  const constraints = {
    video: true,
  };
  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };
  const stopCamera = () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject;
    if (!stream) return;
    const tracks = (stream as MediaStream).getTracks();

    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };
  const capturePhoto = async () => {
    const canvas = document.createElement("canvas");
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context && videoRef.current) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
    }

    const photoDataUrl = canvas.toDataURL("image/png");

    const blob = await fetch(photoDataUrl).then((res) => res.blob());
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ contentType: blob.type, data: reader.result as string });
    };
    reader.readAsDataURL(blob);

    setPhotoData(photoDataUrl);
    uploadImage(blob);
    stopCamera();
  };
  const ResetCamera = () => {
    setPhotoData("");
    startCamera();
    setenable(false);
  };
  const [imageUrl, setImageUrl] = useState(null);
  const uploadImage = (file:any) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "r15rfd4k"); // Your Cloudinary preset
    formData.append("folder", "Healthcare_user_profile"); // Optional: Folder to upload the image

    fetch("https://api.cloudinary.com/v1_1/durtlcmnb/image/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.secure_url) {
          setImageUrl(data.secure_url);
          setSubmitting(false);
          setenable(true); // Set the image URL
        }
      });
  };
  console.log(imageUrl);

  const submit = async() => {
    console.log("submit");
    axios.defaults.withCredentials = false;
    const res = await axios.get("https://api64.ipify.org?format=json");
    axios.defaults.withCredentials = true;
    let IP = res.data.ip;
    console.log(IP);
    let location = "";
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude, "Longitude:", longitude);
          location = `${latitude},${longitude}`;
          console.log(location);
          const formData = {
            session_id:session_id,
            student_id: student._id,
            image: imageUrl,
            student_location:location,
            IP:IP,
            teacher_email:qemail
          }
          console.log(formData);
          try{
            socket.emit("make-attendance",formData);
            socket.on("attendance-response",(data)=>{
              console.log(data);
              setAttendanceStatus(true);
              toast({
                title: "Success",
                description: data,
              });
            })
          }catch(err)
          {
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
  };
  useEffect(() => {
    socket.emit("attendance-status",{session_id,student_id:student._id});
    socket.on("attendance-status",()=>{
      setAttendanceStatus(true);
    })
  },[attendanceStatus]);

  return (
    <div className="flex flex-row-reverse">
      <Modal>
        {attendanceStatus ?"Attendance marked successfully": 
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Make Attendance
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            Click
          </div>
        </ModalTrigger>
}

        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Session to{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Attendance
              </span>{" "}
            </h4>
            <div className="overflow-y-auto h-96">
              <div className="flex md:flex-row flex-col gap-4 justify-center">
                <div className="flex flex-col items-center">
                  <div className="bg-black md:w-[450px] md:h-[338px]">
                    {!photoData && (
                      <video ref={videoRef} width={450} autoPlay={true} />
                    )}
                    {photoData && (
                      <img src={photoData} width={450} alt="Captured" />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between md:w-[450px]">
                    <Button onClick={startCamera}>Start Camera</Button>
                    <Button onClick={capturePhoto}>Capture</Button>
                    <Button onClick={ResetCamera}>Reset</Button>
                  </div>
                </div>
                <div className="flex flex-col items-center max-w-[300px]">
                  <div className="flex flex-col w-full space-y-2 items-start md:space-y-0 md:space-x-2 mb-4">
                  <Label htmlFor="fullname">Full name</Label>
                    <LabelInputContainer>
                      
                      <Input
                        name="fullname"
                        type="text"
                        value={student.name}
                        disabled
                      />
                    </LabelInputContainer>
                  </div>
                  <div className="flex flex-col w-full space-y-2 md:space-y-0 md:space-x-2 mb-4 items-start">
                  <Label htmlFor="email">Email</Label>
                    <LabelInputContainer>
                      
                      <Input
                        name="email"
                        type="emial"
                        value={student.email}
                        disabled
                      />
                    </LabelInputContainer>
                  </div>
                  <div className="flex flex-col w-full space-y-2 md:space-y-0 md:space-x-2 mb-4 items-start">
                  <Label htmlFor="enroll_no">Enrollment No</Label>
                    <LabelInputContainer>
                      
                      <Input
                        name="enroll_no"
                        type="text"
                        value={student.enroll_no}
                        disabled
                        className="text-black"
                      />
                    </LabelInputContainer>
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <Button
              className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28"
              onClick={() => submit()}
              disabled={!enable}
            >{submitting?<><Loader2 className="mr-2 h-4 w-4 animate-spin" />"Please wait"</>:"Submit"}
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}
