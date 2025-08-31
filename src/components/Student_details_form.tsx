"use client";
import React, { use } from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FileUpload } from "./ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { AwardIcon, Loader2 } from "lucide-react";
import { getSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse, division } from "@/types/ApiResponse";
import { useRouter } from "next/navigation";

import { useDebounceCallback } from "usehooks-ts";
import { useAppDispatch } from "@/hooks/hooks";
import { userActions } from "@/store/slice/user";


const Student_details_form = () => {
  
  const dispatch=useAppDispatch();
  const [session, setSession] = useState("");
  const router = useRouter();
  interface Department {
    id: string;
    name: string;
  }

  const [departments, setDepartments] = useState<Department[]>([]);
  interface Division {
    id: string;
    name: string;
  }
  
  const [division, setDivision] = useState<Division[]>([]);
  const debouncedUsername = useDebounceCallback(setSession, 3000);
  
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setSession(session.user._id ?? "");
      }
    }
    fetchData();
  }, []);
  

  useEffect(() => {
    async function fetchDepartment()
    {
    const response=await axios.get("/api/fetch-department");
    
    setDepartments(response.data.data);
    }
    fetchDepartment()
  },[]);

  const [div, setdiv] = useState("");
  const [bran, setbran] = useState("");
  const [gen, setgen] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [issubmitting, setissubmitting] = useState(false);
  
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    let data = {
      fullname: formData.get("fullname"),
      enroll_no: formData.get("enroll_no"),
      dob: formData.get("dob"),
      branch_name: formData.get("branch_name"),
      contact_no: formData.get("contact_no"),
      divison: formData.get("divison"),
      gender: formData.get("gender"),
      address: formData.get("address"),
      url: imageUrl,
      id: session,
    };
   
    try {
      const response = await axios.post(
        "api/student-detail-form",
        {
          data,
        }
      );
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Student details saved successfully",
        });
       
        dispatch(userActions.mysession({id:response.data.data.id,name:response.data.data.name}))
       router.replace("student-complete-profile/face-recognize");
        
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error occure in student details form", err);
      const axiosError = err as AxiosError<ApiResponse>;
      toast({
        title: "Student details saved Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleOne = () => {
    const firstSlide = document.querySelector<HTMLElement>(".first-slide");
    if (firstSlide) firstSlide.style.display = "block";

    const secondSlide = document.querySelector<HTMLElement>(".second-slide");
    if (secondSlide) secondSlide.style.display = "none";

    const thirdSlide = document.querySelector<HTMLElement>(".third-slide");
    if (thirdSlide) thirdSlide.style.display = "none";
  };
  const toggleTwo = () => {
    const Fullname = document.querySelector<HTMLInputElement>(
      "input[name='fullname']"
    )?.value;
    const Enrollment = document.querySelector<HTMLInputElement>(
      "input[name='enroll_no']"
    )?.value;
    const dob =
      document.querySelector<HTMLInputElement>("input[name='dob']")?.value;
    if (Fullname === "" || Enrollment === "" || dob === "" || gen === "") {
      toast({
        title: "Error",
        description: "Fill the all details",
        variant: "destructive",
      });
      return;
    } else {
      const firstSlide = document.querySelector<HTMLElement>(".first-slide");
      if (firstSlide) firstSlide.style.display = "none";

      const secondSlide = document.querySelector<HTMLElement>(".second-slide");
      if (secondSlide) secondSlide.style.display = "block";

      const thirdSlide = document.querySelector<HTMLElement>(".third-slide");
      if (thirdSlide) thirdSlide.style.display = "none";
    }
  };
  const toggleThree = () => {
    const Contact = document.querySelector<HTMLInputElement>(
      "input[name='contact_no']"
    )?.value;
    const address = document.querySelector<HTMLInputElement>(
      "input[name='address']"
    )?.value;

    if (bran === "" || Contact === "" || address === "" || div === "") {
      toast({
        title: "Error",
        description: "Fill the all details",
        variant: "destructive",
      });
      return;
    } else {
      const firstSlide = document.querySelector<HTMLElement>(".first-slide");
      if (firstSlide) firstSlide.style.display = "none";

      const secondSlide = document.querySelector<HTMLElement>(".second-slide");
      if (secondSlide) secondSlide.style.display = "none";

      const thirdSlide = document.querySelector<HTMLElement>(".third-slide");
      if (thirdSlide) thirdSlide.style.display = "block";
    }
  };

  const handleFileUpload = (files: File[]) => {
    setissubmitting(true);
    const formDatad = new FormData();
    formDatad.append("file", files[0]);
    formDatad.append("upload_preset", "r15rfd4k"); // Your Cloudinary preset
    formDatad.append("folder", "Healthcare_user_profile"); // Optional: Folder to upload the image

    fetch("https://api.cloudinary.com/v1_1/durtlcmnb/image/upload", {
      method: "POST",
      body: formDatad,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.secure_url) {
          setImageUrl(data.secure_url);
          setissubmitting(false); // Set the image URL
        }
      });
    
  };

  const handlebrachange = async(e: string) => {
    
    const response=await axios.post("/api/f-fetch-division",{department_id:e});
    
    setDivision(response.data.data);
  };


  return (
    <>
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to Attendance System
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Fill first profile details
        </p>
      
        <form
          className="my-8"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        
        >
          <div className="first-slide">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer>
                <Label htmlFor="fullname">Full name</Label>
                <Input
                  placeholder="bhavin"
                  name="fullname"
                  type="text"
                  required
                />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="Enrollmentno">Enrollment No</Label>
              <Input
                id="enroll_no"
                name="enroll_no"
                placeholder="22BECE3XXXX"
                type="text"
                required
              />
            </LabelInputContainer>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="dob">Date Of Birth</Label>
                <Input
                  id="dob"
                  placeholder=""
                  type="date"
                  name="dob"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  max={new Date().toISOString().split("T")[0]}
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" required onValueChange={(e) => setgen(e)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                onClick={toggleTwo}
                type="button"
              >
                Next &rarr;
                <BottomGradient />
              </button>
            </div>
          </div>
          <div className="second-slide" style={{ display: "none" }}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 ">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="branch_name">Select Branch</Label>
                <Select
                  name="branch_name"
                  required
                  onValueChange={(e) => {setbran(e) 
                    handlebrachange(e)
                  }}
                  
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="CONTACT">Contact Number</Label>
                <Input
                  id="contact_no"
                  placeholder="+91 6354XXXXXX"
                  type="text"
                  name="contact_no"
                  max={10}
                  pattern="\d{10}"
                  required
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="Divison">Division</Label>
                <Select
                  required
                  name="divison"
                  onValueChange={(e) => setdiv(e)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {division?.map((div) => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  placeholder="Enter Address"
                  name="address"
                  id="address"
                />
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                onClick={toggleOne}
                type="button"
              >
                Back &larr;
                <BottomGradient />
              </button>
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                onClick={toggleThree}
                type="button"
              >
                Next &rarr;
                <BottomGradient />
              </button>
            </div>
          </div>
          <div className="third-slide" style={{ display: "none" }}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 ">
              <LabelInputContainer className="mb-4">
                <Label htmlFor="profile_image">Upload Profile Image</Label>
                <FileUpload onChange={handleFileUpload} />
              </LabelInputContainer>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                onClick={toggleTwo}
                type="button"
              >
                Back &larr;
                <BottomGradient />
              </button>
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] flex items-center justify-center"
                type="submit"
                disabled={issubmitting}
              >
                {issubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Submit"
                )}
                <BottomGradient />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default Student_details_form;
