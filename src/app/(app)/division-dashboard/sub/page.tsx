"use client";
import React from "react";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Book, GraduationCap } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { TeacherAttedanceActions } from "@/store/slice/teacherattendance";
import { useAppDispatch } from "@/hooks/hooks";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacher_id = searchParams.get("teacherid"); // Get query parameter
  const subject_id = searchParams.get("subjectid");

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [selectedSubject, setSelectedSubject] = useState("");
  //   const { teacherid } = useAppSelector((state) => state.user);
  const [subject, setSubjects] = useState<any[]>([]);
  const [subjects, setSubjectss] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>({});

  useEffect(() => {
    subject.map((sub) => {
      // ✅ Prevent duplicates in subjects
      setSubjectss((prevSubjects: any) => {
        if (prevSubjects.some((s: any) => s.id === sub._id)) {
          return prevSubjects; // Skip if already exists
        }
        return [...prevSubjects, { id: sub._id, name: sub.subject_name }];
      });

      // ✅ Prevent duplicates in sessionData
      setSessionData((prevSessionData: any) => {
        if (prevSessionData[sub._id]) {
          return prevSessionData; // Skip if already exists
        }
        return {
          ...prevSessionData,
          [sub._id]: {
            totalSessions: sub.total_session,
            completedSessions: sub.total_completed_session,
          },
        };
      });
    });
  }, [subject]);

  async function fetchSubject() {
    const response = await axios.get(
      `/api/fetch-subject?teacherid=${teacher_id}`
    );

    setSubjects(response.data.data);
    dispatch(TeacherAttedanceActions.setTeacherAttendance(response.data.data));
    setSelectedSubject(subject_id as string);

    return response.data;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubject,
  });

  useEffect(() => {
    if (data) {
      setSubjects(data.data);
    }
  }, [data, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
        <Progress value={33} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subject Dashboard
          </h1>
          <p className="text-muted-foreground">
            Select a subject to view session details and attendance information.
          </p>
        </div>
      </div>

      {selectedSubject ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {subjects.find((s) => s.id === selectedSubject)?.name}
                </CardTitle>
                <CardDescription>
                  Session and attendance overview
                </CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Book className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          sessionData[
                            selectedSubject as keyof typeof sessionData
                          ]?.totalSessions
                        }
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Completed Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          sessionData[
                            selectedSubject as keyof typeof sessionData
                          ]?.completedSessions
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/division-dashboard/sub//${selectedSubject}?teacherid=${teacher_id}&subjectid=${subject_id}`}
                  >
                    <Button>
                      View All Attendance
                      <GraduationCap className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">
              No Subject Selected
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Please select a subject from the dropdown above to view session
              details and attendance information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
