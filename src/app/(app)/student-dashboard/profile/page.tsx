"use client";

import {  useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useAppSelector } from "@/hooks/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// Mock student data - in a real app, this would come from an API or database

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["student"],
    queryFn: async () => {
      const response = await axios.get(`/api/profile?student_id=${studentid}`);
      setStudentData(response.data.data);
      return response.data;
    },
  });
  const { studentid } = useAppSelector((state) => state.user);
  

  interface StudentData {
    name: string;
    avatar: string;
    department: string;
    enrollmentNumber: string;
    dob: string;
    gender: string;
    bio: string;
    division: string;
    email: string;
    phone: string;
    address: string;
  }

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="mr-2 h-11 w-11 animate-spin" />
        </div>
      );
    }

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={studentData?.avatar} alt={studentData?.name} />
            <AvatarFallback>
              {studentData?.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{studentData?.name}</h2>
            <p className="text-muted-foreground">• {studentData?.department}</p>
            <p className="text-sm text-muted-foreground">
              Enrollment: {studentData?.enrollmentNumber}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[500px] flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Details</TabsTrigger>
            <TabsTrigger value="contact">Contact & Address</TabsTrigger>
          </TabsList>

          <>
            <TabsContent
              value="personal"
              className="flex-1 overflow-y-auto p-1 h-[400px]"
            >
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Full Name
                    </h3>
                    <p className="mt-1">{studentData?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Date of Birth
                    </h3>
                    <p className="mt-1">{studentData?.dob}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Gender
                    </h3>
                    <p className="mt-1 capitalize">{studentData?.gender}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Bio</h3>
                  <p className="mt-1">{studentData?.bio}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="academic"
              className="flex-1 overflow-y-auto p-1 h-[400px]"
            >
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Enrollment Number
                    </h3>
                    <p className="mt-1">{studentData?.enrollmentNumber}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Department
                    </h3>
                    <p className="mt-1">{studentData?.department}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Division
                    </h3>
                    <p className="mt-1">{studentData?.division}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="contact"
              className="flex-1 overflow-y-auto p-1 h-[400px]"
            >
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Email</h3>
                    <p className="mt-1">{studentData?.email}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Phone Number
                    </h3>
                    <p className="mt-1">{studentData?.phone}</p>
                  </div>
                </div>

                <Separator className="my-4" />
                <h3 className="text-lg font-medium mb-4">Address</h3>

                <div>
                  <h3 className="font-medium text-muted-foreground">Address</h3>
                  <p className="mt-1">{studentData?.address}</p>
                </div>
              </div>
            </TabsContent>
          </>
        </Tabs>
      </CardContent>
    </Card>
  );
}
