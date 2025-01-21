import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedModalDemo } from "./AnimatedModalDemo";

const TeacherTable = ({ children }: any) => {
  console.log(children);
  return (
    <>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Session Name</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Division</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children
            ? children.map((slot: any) => {
                return (
                  <TableRow key={slot._id}>
                    <TableCell className="font-medium">
                      {slot.subject}
                    </TableCell>
                    <TableCell>
                      {slot.start_time} To {slot.end_time}
                    </TableCell>
                    <TableCell>{slot.division_name}</TableCell>
                    <TableCell className="text-right">{slot.status}</TableCell>
                  </TableRow>
                );
              })
            : ""}
        </TableBody>
      </Table>
    </>
  );
};

export default TeacherTable;
