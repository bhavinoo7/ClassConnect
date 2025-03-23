"use client";
import { useRef, useState, useEffect } from "react";
import { useAppSelector } from "@/hooks/hooks";

import axios from "axios";

import { signOut } from "next-auth/react";
import { useAppDispatch } from "@/hooks/hooks";
import { userActions } from "@/store/slice/user";
export default function Page() {
    const dispatch=useAppDispatch()
    const {student}=useAppSelector(state=>state.user);
    const {studentname}=useAppSelector(state=>state.user);
   
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [instruction, setInstruction] = useState("Align your face in the center");
  const [step, setStep] = useState("center");
  const [stream, setStream] = useState<MediaStream | null>(null); // Store MediaStream
  
  useEffect(() => {
    async function getCameraStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }

    getCameraStream();
  }, []);

  const startRecording = async () => {
    if (!stream) {
      console.error("No video stream available!");
      return;
    }

    setInstruction(`Recording ${step} face...`);
    
    mediaRecorderRef.current = new MediaRecorder(stream);
    let chunks: BlobPart[] = [];

    mediaRecorderRef.current.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const formData = new FormData();
      formData.append("video", blob, `${step}.webm`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_PY_NGROK}/analyze/${step}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
    
      if (!result.success) {
        setInstruction(`Please correctly align your face (${step}) and retry.`);
        return;
      }

      if (step === "center") {
        setStep("left");
        setInstruction("Turn your face left");
      } else if (step === "left") {
        setStep("right");
        setInstruction("Turn your face right");
      } else {
        setInstruction("Face recordings complete! Training model...");
        const formData = new FormData();
        formData.append("student_id", student || "");
        formData.append("student_name", studentname || "");
        const response=await axios.post(`${process.env.NEXT_PUBLIC_PY_NGROK}/train`,formData);
        const result = await response.data;
        if(result.message=="Training completed!")
        {
          
          dispatch(userActions.outmySession());
          signOut();
          localStorage.removeItem("status");
        }
      }
    };

    mediaRecorderRef.current.start();
    setTimeout(() => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">{instruction}</h1>
      <video ref={videoRef} autoPlay playsInline className="border-2 border-white" />
      <button onClick={startRecording} className="mt-4 p-2 bg-blue-600 rounded">Start</button>
    </div>
  );
}
