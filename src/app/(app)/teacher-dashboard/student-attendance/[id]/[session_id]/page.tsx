"use client";
import { useParams } from "next/navigation";
import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const page = () => {
  const { Subjects } = useAppSelector((state) => state.teacherattendance);
  const parms = useParams();
  const [totalp, setTotalp] = useState(0);
  const [totala, setTotala] = useState(0);
  const [attendance, setAttendance] = useState<
    {
      student_name: any;
      student_enrollment: any;
      date: any;
      time: any;
      status: any;
      votes: any;
      confidence: any;
    }[]
  >([]);

  useEffect(() => {
    if (Subjects.length > 0) {
      const newAttendance: any[] = [];

      Subjects.forEach((sub: any) => {
        if (sub?._id == parms.id) {
          sub.attendance?.forEach((att: any) => {
            if (att.session_id[0] == parms.session_id) {
              att.Attendance.forEach((enroll: any) => {
                const data = {
                  student_name: enroll.student_id?.name,
                  student_enrollment: enroll.student_id?.enroll_no,
                  date: enroll.date.split("T")[0],
                  time: enroll.date.split("T")[1],
                  status: enroll.status,
                  votes: enroll.vote,
                  confidence: enroll.confidence,
                };

                // ✅ Prevent duplicates
                if (
                  !newAttendance.some(
                    (item) =>
                      item.student_enrollment === data.student_enrollment &&
                      item.date === data.date
                  )
                ) {
                  newAttendance.push(data);
                }
              });
            }
          });
        }
      });

      setAttendance(newAttendance);
    }
  }, [Subjects]);

  useEffect(() => {
    if (attendance.length > 0) {
      const totalPresent = attendance.filter(
        (enrollment) => enrollment.status === "Present"
      ).length;
      const totalAbsent = attendance.filter(
        (enrollment) => enrollment.status === "Absent"
      ).length;
      setTotalp(totalPresent);
      setTotala(totalAbsent);
    }
  }, [attendance]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filteredData = attendance.filter((enrollment) => {
    const searchString = searchTerm.toLowerCase();
    return (
      enrollment.student_name?.toLowerCase().includes(searchString) ||
      (enrollment.student_enrollment?.toLowerCase().includes(searchString) ??
        false) ||
      enrollment.date?.toLowerCase().includes(searchString) ||
      enrollment.time?.toLowerCase().includes(searchString) ||
      enrollment.status?.toLowerCase().includes(searchString)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Attendance Management
          </CardTitle>
        </CardHeader>
        <div className="flex justify-center items-center space-x-4 mx-5">
          <Card className="w-1/2 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalp}</div>
            </CardContent>
          </Card>
          <Card className="w-1/2 text-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totala}</div>
            </CardContent>
          </Card>
        </div>
        <CardContent>
          <div className="mb-6 mt-5 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search date..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>student Enrollment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className=" md:table-cell">Votes</TableHead>
                  <TableHead className=" md:table-cell">confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((enrollment) => (
                    <TableRow key={uuidv4()}>
                      <TableCell className="font-medium">
                        {enrollment.student_name}
                      </TableCell>
                      <TableCell>{enrollment.student_enrollment}</TableCell>
                      <TableCell>{enrollment.date}</TableCell>
                      <TableCell>{enrollment.time}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(enrollment.status)}>
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className=" md:table-cell text-green-400">
                        {enrollment.votes ? enrollment.votes : "-"}
                      </TableCell>
                      <TableCell className=" md:table-cell text-green-400">
                        {enrollment.confidence ? enrollment.confidence : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No Data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredData.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to{" "}
                {indexOfLastItem > filteredData.length
                  ? filteredData.length
                  : indexOfLastItem}{" "}
                of {filteredData.length} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {pageNumbers.map((number) => (
                    <PaginationItem key={number}>
                      <PaginationLink
                        onClick={() => handlePageChange(number)}
                        isActive={currentPage === number}
                      >
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
