"use client";

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/hooks";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const teacher_id = searchParams.get("teacherid"); // Get query parameter
  const subject_id = searchParams.get("subjectid");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams<{ sid: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { Subjects } = useAppSelector((state) => state.teacherattendance);

  const [enrollmentData, setEnrollmentData] = useState<
    {
      session_id?: string;
      session_name?: string;
      date?: string;
      time?: string;
    }[]
  >([]);
  const [sub1, setsub1] = useState([]);
  useEffect(() => {
    if (Subjects.length > 0) {
      Subjects.filter((sub: any) => {
        if (sub?._id == params.sid) {
          setsub1(sub.attendance);
        }
      });
    }
  }, [Subjects]);

  useEffect(() => {
    if (sub1) {
      const newData = sub1
        .map(
          (s: {
            session_id: string[];
            session_name: string;
            date: string;
          }) => ({
            session_id: s.session_id[0],
            session_name: s.session_name,
            date: s.date.split("T")[0],
            time: s.date.split("T")[1],
          })
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ); // ✅ Sorting based on date change a to b for ascending order and b to a for descending order

      // ✅ Updating state once with sorted data
      setEnrollmentData((prev: any) => [...prev, ...newData]);
    }
  }, [sub1]);

  // Filter data based on search term
  const filteredData = enrollmentData.filter((enrollment) => {
    const searchString = searchTerm.toLowerCase();
    return (
      enrollment.session_id?.toLowerCase().includes(searchString) ||
      (enrollment.session_name?.toLowerCase().includes(searchString) ??
        false) ||
      enrollment.date?.toLowerCase().includes(searchString) ||
      enrollment.time?.toLowerCase().includes(searchString)
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

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "inactive":
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
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
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
                  <TableHead>Session ID</TableHead>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className=" md:table-cell">Status</TableHead>
                  <TableHead className=" md:table-cell">
                    View attendance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((enrollment) => (
                    <TableRow key={enrollment.session_id}>
                      <TableCell className="font-medium">
                        {enrollment.session_id}
                      </TableCell>
                      <TableCell>{enrollment.session_name}</TableCell>
                      <TableCell>{enrollment.date}</TableCell>
                      <TableCell>{enrollment.time}</TableCell>
                      <TableCell className=" md:table-cell text-green-400">
                        Completed
                      </TableCell>
                      <TableCell className=" md:table-cell">
                        <Button
                          onClick={() =>
                            router.replace(
                              `/division-dashboard/sub/${params.sid}/${enrollment.session_id}?teacherid=${teacher_id}&subjectid=${subject_id}`
                            )
                          }
                        >
                          view Attendance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No sessions found
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
}
