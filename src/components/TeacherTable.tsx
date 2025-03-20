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


import { v4 as uuidv4 } from 'uuid';



const TeacherTable = ({ children }: any) => {
 
  return (
    <>
      <Table>
        <TableCaption>A list of your recent Session.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Session Name</TableHead>
            <TableHead className="w-[100px]">Session Type</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Division</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children
            ? children.map((slot: any) => {
                return (
                  <TableRow key={uuidv4()}>
                    <TableCell className="font-medium">
                      {slot.subject}
                    </TableCell>
                    <TableCell className="font-medium">
                      {slot.is_lab ? "Lab" : "Lecture"}
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
