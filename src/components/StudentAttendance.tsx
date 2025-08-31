"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "./ui/animated-modal";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Teacher_live_table from "./Teacher_live_table";
import { useAppSelector } from "@/hooks/hooks";
import { useToast } from "@/hooks/use-toast";

export function StudentAttendance({ session_id }: any) {
  const {teacherid}=useAppSelector((state)=>state.user);
  const {toast}=useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [recognize, setRecognize] = useState([]);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enable, setEnable] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [StudentAttendance, setStudentAttendance] = useState([]);
  // Constraints for camera access
  const constraints = { video: true };
 
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      recordedChunks.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setEnable(true);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setRecording(true);

      // Stop recording automatically after 30 seconds
      setTimeout(() => {
        stopRecording();
      }, 30000);
    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setRecording(false);
  };

  const resetRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setEnable(false);
    startRecording();
  };

  const uploadVideo = async () => {
    if (!videoBlob) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", videoBlob);
    formData.append("upload_preset", "r15rfd4k"); // Replace with your Cloudinary preset
    formData.append("folder", "Student_Attendance_Videos"); // Optional folder

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/durtlcmnb/video/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setCloudinaryUrl(data.secure_url);
  
        // setSubmitting(false);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_PY_NGROK}/recognize`, {
          video_url: data.secure_url,
        });
     
        
       
        if (response.data.message === "Face recognition completed") {
          toast({
            title: "Success",
            description: "Face recognition completed now marking attendance",
          });
          setRecognize(response.data.recognized_students);
        
          const respons=await axios.post("/api/fetch-attendance",{session_id,recognize:response.data.recognized_students});
      
      setStudentAttendance(respons.data.data);
          console.log(recognize);
          toast({
            title: "Success",
            description: "Marking Attendance Completed",
          });
        }
        
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setSubmitting(false);
    }
  };

  const submitAttendance = async () => {
    if (!cloudinaryUrl) return;
    
    setSubmitting(true);
    const response=await axios.post("/api/close-session",{teacher_id:teacherid});
    
    if (response.data.success) {
      
      toast({
        title: "Success",
        description: "Session closed successfully",
      })
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-row-reverse">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Make Attendance
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            Click
          </div>
        </ModalTrigger>

        <ModalBody>
          <ModalContent className="overflow-y-auto h-96">
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Record Video for{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Attendance
              </span>
            </h4>

            <div className="flex flex-col items-center">
              <div className="bg-black md:w-[450px] md:h-[338px]">
                {!videoUrl && (
                  <video
                    ref={videoRef}
                    width={450}
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                {videoUrl && <video src={videoUrl} width={450} controls />}
              </div>
              <div className="mt-1 flex justify-between md:w-[450px]">
                {!recording && (
                  <Button onClick={startRecording}>Start Recording</Button>
                )}
                {recording && <Button onClick={stopRecording}>Stop</Button>}
                {videoUrl && <Button onClick={resetRecording}>Reset</Button>}
              </div>
            </div>

            {videoUrl && (
              <div className="flex flex-col items-center mt-4">
                {!cloudinaryUrl && (
                  <Button onClick={uploadVideo} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Upload Video"
                    )}
                  </Button>
                )}
                {cloudinaryUrl && (
                  <p className="text-green-500">Video uploaded successfully!</p>
                )}
              </div>
            )}
            <div className="">
            <Teacher_live_table attendance={StudentAttendance} />
            </div>
          </ModalContent>

          <ModalFooter className="gap-4">
            <Button
              className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28"
              onClick={submitAttendance}
              disabled={!cloudinaryUrl}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}
