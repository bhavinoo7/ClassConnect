import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";

const Teacher_live_table = ({ attendance }: any) => {
  const [liveattendance, setliveattendance] = useState<any[]>([]);
  useEffect(() => {
    setliveattendance(attendance);
  }, [attendance]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>name</TableHead>
            <TableHead>enrollment</TableHead>
            <TableHead>time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liveattendance &&
            liveattendance.map((attendance: any) => (
              <TableRow key={uuidv4()}>
                <TableCell className="font-medium">
                  {attendance.student_id._id}
                </TableCell>
                <TableCell>{attendance.student_id.name}</TableCell>
                <TableCell>{attendance.student_id.enroll_no}</TableCell>
                <TableCell>{attendance.time}</TableCell>

                <TableCell>{attendance.date}</TableCell>
                <TableCell className="text-right">
                  {attendance.status}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Teacher_live_table;
