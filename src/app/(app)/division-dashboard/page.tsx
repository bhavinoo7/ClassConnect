"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BookOpen, Calendar, ClipboardList, Eye, FileDown, GraduationCap, Loader2, Search, Users } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import axios from "axios"
import { timeTableActions } from "@/store/slice/timetable"
import { useAppDispatch } from "@/hooks/hooks"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Page() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const [selectedSemester, setSelectedSemester] = useState("")
  const [semesters, setSemesters] = useState<{ id: string; name: string; current: boolean }[]>([])

  const [semesterData, setSemesterData] = useState<
    Record<
      string,
      {
        students: number
        teachers: number
        subjects: number
        progress: number
        startDate: string
        endDate: string
      }
    >
  >({})

  const currentSemesterData = semesterData[selectedSemester as keyof typeof semesterData]

  // Mock data
  const divisionData = {
    students: 245,
    teachers: 18,
    subjects: 12,
    semester: "Fall 2025",
    semesterStartDate: "August 15, 2025",
    semesterEndDate: "December 20, 2025",
  }

  const [subjects, setSubjects] = useState<
    {
      subject_id: any
      teacher_id: any
      id: number
      name: string
      teacher_name: string
      total_completed_session: number
    }[]
  >([])

  const [students, setStudents] = useState<
    {
      id: number
      name: string
      enrollment: string
      total_session: number
      present_sessions: number
      absent_sessions: number
      percentage: number
    }[]
  >([])

  const [sessionData, setSessionData] = useState("")

  // Pagination state
  const [subjectPage, setSubjectPage] = useState(1)
  const [studentPage, setStudentPage] = useState(1)
  const itemsPerPage = 6

  // Search state
  const [subjectSearch, setSubjectSearch] = useState("")
  const [studentSearch, setStudentSearch] = useState("")

  function calculateProgress(start_date: any, end_date: any) {
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const today = new Date()

    const totalDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) // Total days
    const daysPassed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) // Days passed

    return Math.min(Math.max((daysPassed / totalDuration) * 100, 0), 100)
  }

  useEffect(() => {
    fetch("/api/get-cookie")
      .then((res) => res.json())
      .then((data) => {
        setSessionData(data.divisionSession.division_id)
        dispatch(timeTableActions.setdivisionid(data.divisionSession.division_id))
      })
  }, [])

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await axios.get(`/api/fetch-division-data?division_id=${sessionData}`)
      

      const sem = response.data.data.map((se: any) => {
        return {
          id: se.semester_id,
          name: se.semester_name,
          current: se.current,
        }
      })
      sem.map((se: any) => {
        if (se.current) {
          setSelectedSemester(se.id)
        }
      })
      dispatch(timeTableActions.setsem(sem))
      const semData = response.data.data.map((se: any) => {
        return {
          id: se.semester_id,
          students: 45,
          teachers: se.total_subjects,
          subjects: se.total_subjects,
          progress: calculateProgress(se.semester_start_date.split("T")[0], se.semester_end_date.split("T")[0]),
          startDate: se.semester_start_date.split("T")[0],
          endDate: se.semester_end_date.split("T")[0],
        }
      })
      if (selectedSemester) {
        const sub = response.data.data.map((se: any) => {
          if (se.semester_id.toString() == selectedSemester.toString()) {
            const s = se.Subjects.map((sub: any) => {
              return {
                id: sub.subject_id,
                name: sub.subject_name,
                code: sub.subject_code,
                teacher_name: sub.teacher_name,
                teacher_id: sub.teacher_id,
                total_session: sub.total_session,
                total_completed_session: sub.total_completed_session,
              }
            })
            return s
          }
        })
        const student = response.data.data.map((se: any) => {
          if (se.semester_id.toString() == selectedSemester.toString()) {
            const s = se.studentr.map((sub: any) => {
              return {
                id: sub.student_id,
                name: sub.student_name,
                enrollment: sub.student_enrollment,
                total_session: sub.total_session,
                present_sessions: sub.present_sessions,
                absent_sessions: sub.absent_sessions,
                percentage: sub.percentage,
              }
            })
            return s
          }
        })

        setSubjects(sub[0])

        setStudents(student[0])
      }
      setSemesterData(Object.assign({}, ...semData.map((s: any) => ({ [s.id]: s }))))
      setSemesters(sem)
      setIsLoading(false);
    }
    if (sessionData) {
      fetchData()
    }
  }, [sessionData, selectedSemester])

  // Filter subjects based on search
  const filteredSubjects =
    subjects?.filter(
      (subject) =>
        subject?.name?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        subject?.teacher_name?.toLowerCase().includes(subjectSearch.toLowerCase()),
    ) || []

  // Filter students based on search
  const filteredStudents =
    students?.filter(
      (student) =>
        student?.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student?.enrollment?.toLowerCase().includes(studentSearch.toLowerCase()),
    ) || []

  // Paginate subjects
  const paginatedSubjects = filteredSubjects.slice((subjectPage - 1) * itemsPerPage, subjectPage * itemsPerPage)

  // Paginate students
  const paginatedStudents = filteredStudents.slice((studentPage - 1) * itemsPerPage, studentPage * itemsPerPage)

  // Calculate total pages
  const totalSubjectPages = Math.ceil(filteredSubjects.length / itemsPerPage)
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage)

  // Export functions
  const exportToExcel = (data: any[], fileName: string) => {
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Create a workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportToPDF = (data: any[], fileName: string, columns: string[]) => {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.text(fileName, 14, 15)

    // Create table data
    const tableData = data.map((item) => {
      return columns.map((col) => (item[col] !== undefined ? item[col].toString() : ""))
    })

    // Add table headers
    const headers = columns.map((col) => {
      // Convert camelCase or snake_case to Title Case
      return col
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
    })

    // Add table to PDF using autoTable
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 66, 66] },
    })

    // Save the PDF
    doc.save(`${fileName}.pdf`)
  }

  const handleExportSubjects = (format: "excel" | "pdf") => {
    // Prepare data for export - use all filtered subjects, not just paginated ones
    const exportData = filteredSubjects.map((subject) => ({
      Subject: subject.name,
      Teacher: subject.teacher_name,
      CompletedSessions: subject.total_completed_session,
    }))

    const fileName = `Subject_Attendance_${new Date().toISOString().split("T")[0]}`

    if (format === "excel") {
      exportToExcel(exportData, fileName)
    } else {
      exportToPDF(exportData, fileName, ["Subject", "Teacher", "CompletedSessions"])
    }
  }

  const handleExportStudents = (format: "excel" | "pdf") => {
    // Prepare data for export - use all filtered students, not just paginated ones
    const exportData = filteredStudents.map((student) => ({
      Name: student.name,
      Enrollment: student.enrollment,
      TotalSessions: student.total_session,
      PresentSessions: student.present_sessions,
      AbsentSessions: student.absent_sessions,
      AttendancePercentage: `${student.percentage.toString().split(".")[0]}%`,
    }))

    const fileName = `Student_Attendance_${new Date().toISOString().split("T")[0]}`

    if (format === "excel") {
      exportToExcel(exportData, fileName)
    } else {
      exportToPDF(exportData, fileName, [
        "Name",
        "Enrollment",
        "TotalSessions",
        "PresentSessions",
        "AbsentSessions",
        "AttendancePercentage",
      ])
    }
  }
  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="mr-2 h-11 w-11 animate-spin" />
        </div>
      );
    }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Division Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">Current:</span>
          {/* <span className="text-sm font-medium">{divisionData.semester}</span> */}
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        {/* Semester Selector */}
        <div className="mb-6">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Semester</h2>
              <div className="grid gap-4 md:grid-cols-4">
                {semesters.map((semester) => (
                  <div
                    key={semester.id}
                    className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSemester === semester.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedSemester(semester.id)}
                  >
                    <span className="font-medium">{semester.name}</span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {semester.current ? "Current Semester" : "Past Semester"}
                      </span>
                      {semester.current && <span className="ml-auto flex h-2 w-2 rounded-full bg-primary"></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Students Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSemesterData?.students}</div>
              <p className="text-xs text-muted-foreground">Active students in this division</p>
            </CardContent>
          </Card>

          {/* Teachers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSemesterData?.teachers}</div>
              <p className="text-xs text-muted-foreground">Faculty assigned to this division</p>
            </CardContent>
          </Card>

          {/* Subjects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSemesterData?.subjects}</div>
              <p className="text-xs text-muted-foreground">Subjects taught in this division</p>
            </CardContent>
          </Card>

          {/* Semester Progress Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Semester Progress</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSemesterData?.progress.toString().split(".")[0]}%</div>
              <Progress value={currentSemesterData?.progress} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {currentSemesterData?.startDate} - {currentSemesterData?.endDate}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>

          <Tabs defaultValue="subjects">
            <TabsList className="mb-4">
              <TabsTrigger value="subjects">By Subject</TabsTrigger>
              <TabsTrigger value="students">By Student</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Attendance</CardTitle>
                  <CardDescription>View attendance statistics by subject</CardDescription>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subjects or teachers..."
                      className="pl-8"
                      value={subjectSearch}
                      onChange={(e) => {
                        setSubjectSearch(e.target.value)
                        setSubjectPage(1) // Reset to first page on search
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="text-right">Attendance %</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubjects.length > 0 ? (
                        paginatedSubjects.map((subject) => (
                          <TableRow key={uuidv4()}>
                            <TableCell className="font-medium">{subject?.name}</TableCell>
                            <TableCell>{subject?.teacher_name}</TableCell>
                            <TableCell className="text-right">{subject?.total_completed_session}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `division-dashboard/sub?teacherid=${subject?.teacher_id}&subjectid=${subject?.id}`,
                                  )
                                }
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No subjects found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {totalSubjectPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setSubjectPage((p) => Math.max(1, p - 1))}
                            className={subjectPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalSubjectPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink onClick={() => setSubjectPage(i + 1)} isActive={subjectPage === i + 1}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setSubjectPage((p) => Math.min(totalSubjectPages, p + 1))}
                            className={subjectPage === totalSubjectPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportSubjects("excel")}>Export to Excel</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportSubjects("pdf")}>Export to PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Student Attendance</CardTitle>
                  <CardDescription>View attendance statistics by student</CardDescription>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students or enrollment numbers..."
                      className="pl-8"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value)
                        setStudentPage(1) // Reset to first page on search
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead className="text-right">Overall Attendance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((student) => (
                          <TableRow key={uuidv4()}>
                            <TableCell className="font-medium">{student?.name}</TableCell>
                            <TableCell>{student?.enrollment}</TableCell>
                            <TableCell className="text-right">
                              {student?.percentage.toString().split(".")[0]}%
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.replace(`division-dashboard/${student?.id}sm${selectedSemester}`)}
                              >
                                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {totalStudentPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                            className={studentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalStudentPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink onClick={() => setStudentPage(i + 1)} isActive={studentPage === i + 1}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                            className={studentPage === totalStudentPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportStudents("excel")}>Export to Excel</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportStudents("pdf")}>Export to PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
