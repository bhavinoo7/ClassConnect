"use client"

import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
// Mock attendance data


import { useAppSelector } from "@/hooks/hooks"


export default function Page() {
  
  const {studentreport}=useAppSelector((state)=>state.user);
  console.log(studentreport);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [subject_name, setSubject_name] = useState("");
  const params = useParams();
  type AttendanceRecord = {
    id: string;
    date: string;
    time: string;
    status: string;
    votes: number;
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  console.log(params.sub_id);
  useEffect(() => {
    async function fetchData() {  
    console.log(params.sub_id);
    if(params.sub_id && params.sub_id.length > 0){
      console.log("Hello");
      let id = 0;
      studentreport?.map((item)=>{
        if(item.subject_id===params.sub_id){
          setSubject_name(item.subject_name as unknown as string);
          item.attendance.map((item1:any)=>{ 
            
            setAttendanceData((prev)=>{
              if(prev.filter((i)=>i.time===item1.time.split("T")[1]).length>0){
                return prev;
              }
              return[...prev,{id: uuidv4(), date: item1.date.split("T")[0], time: item1.time.split("T")[1], status: item1.status, votes: item1.vote}]})
          })
          
        }
      })
      
    }
  }
  fetchData();
  }, [params.sub_id]);
  // const attendanceData = [
  //   {
  //     id: 1,
  //     date: "2024-02-21",
  //     time: "09:00 AM",
  //     name: "John Smith",
  //     status: "present",
  //     votes: 3,
  //   },
  //   {
  //     id: 2,
  //     date: "2024-02-21",
  //     time: "09:00 AM",
  //     name: "Emma Wilson",
  //     status: "absent",
  //     votes: 4,
  //   },
  //   {
  //     id: 3,
  //     date: "2024-02-20",
  //     time: "09:00 AM",
  //     name: "John Smith",
  //     status: "present",
  //     votes: 5,
  //   },
  //   {
  //     id: 4,
  //     date: "2024-02-20",
  //     time: "09:00 AM",
  //     name: "Emma Wilson",
  //     status: "present",
  //     votes: 3,
  //   },
  //   {
  //     id: 5,
  //     date: "2024-02-19",
  //     time: "09:00 AM",
  //     name: "John Smith",
  //     status: "absent",
  //     votes: 4,
  //   },
  // ]
  
  // Calculate statistics
  const totalClasses = attendanceData.length
  const presentClasses = attendanceData.filter((record) => record.status === "Present").length
  const attendancePercentage = Math.round((presentClasses / totalClasses) * 100)
  console.log(attendanceData);
  type SortConfig = {
    key: keyof (typeof attendanceData)[0]
    direction: "asc" | "desc"
  } | null
  const sortedData = [...attendanceData].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1
    return 0
  })

  const requestSort = (key: keyof (typeof attendanceData)[0]) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey: keyof (typeof attendanceData)[0]) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpIcon className="ml-2 h-4 w-4" />
      ) : (
        <ArrowDownIcon className="ml-2 h-4 w-4" />
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center space-x-4">
          <Link href={`/division-dashboard/${params.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subject_name} Attendance</h1>
           
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{attendancePercentage}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Classes Present</p>
                <p className="text-3xl font-bold">
                  {presentClasses}/{totalClasses}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <Progress value={attendancePercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("date")}>
                    Date
                    {getSortIcon("date")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("time")}>
                    Time
                    {getSortIcon("time")}
                  </TableHead>
                  
                  <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                    Status
                    {getSortIcon("status")}
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => requestSort("votes")}>
                    Votes
                    {getSortIcon("votes")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    
                    <TableCell>
                      <Badge variant={record.status === "Present" ? "default" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{record.votes?record.votes:0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

