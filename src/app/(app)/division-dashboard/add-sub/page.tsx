"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Axis3D, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/hooks";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
    const {toast}=useToast();
  const { division_id } = useAppSelector((state) => state.timetable);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    async function fetchdata() {
      const response = await axios.get(
        `/api/fetch-teacher?divisionid=${division_id}`
      );
      if (response.data.success) {
        const data = response.data.data.map(
          (teacher: { _id: number; name: string }) => ({
            id: teacher._id,
            name: teacher.name,
          })
        );
        setTeachers(data);
      }
    }
    if (division_id) {
      fetchdata();
    }
  }, [division_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission

    
    if (!selectedTeacher) {
      alert("Please select a teacher.");
      return;
    }
    if (!subjectName || !subjectCode) {
      alert("Please fill in all fields.");
      return;
    }

  

    const response = await axios.post("/api/add-subject", {
      name: subjectName,
      code: subjectCode,
      teacher: selectedTeacher,
      division_id,
    });
    if (response.data.success) {
      toast({
        title: "Success",
        description: "Subject added successfully",
        variant: "default",
      })
    } else {
        toast({
            title: "Error",
            description: response.data.message,
            variant: "destructive",
        })
    }

    // Reset form fields
    setSubjectName("");
    setSubjectCode("");
    setSelectedTeacher(null);
    // Reset form or show success message
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Mathematics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-code">Subject Code</Label>
            <Input
              id="subject-code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="e.g. MATH101"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Select Teacher</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedTeacher
                    ? teachers.find((teacher) => teacher.id === selectedTeacher)
                        ?.name
                    : "Select teacher..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search teacher..." />
                  <CommandList>
                    <CommandEmpty>No teacher found.</CommandEmpty>
                    <CommandGroup>
                      {teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          value={teacher.name}
                          onSelect={() => {
                            setSelectedTeacher(
                              teacher.id === selectedTeacher ? null : teacher.id
                            );
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTeacher === teacher.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {teacher.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
