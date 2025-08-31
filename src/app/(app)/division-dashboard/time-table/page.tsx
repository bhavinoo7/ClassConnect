"use client";
import { v4 as uuidv4 } from "uuid";
import { type JSX, useEffect, useState } from "react";
import {
  Clock,
  Plus,
  Save,
  Trash2,
  Coffee,
  Calendar,
  Edit,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { timeTableActions } from "@/store/slice/timetable";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Days of the week
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Subject colors for the timetable

const colors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-red-100 border-red-300 text-red-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-orange-100 border-orange-300 text-orange-800",
];
const getRandomColor = (index: number) => colors[index % colors.length];

// Type for timetable entry
type TimetableEntry = {
  id: string;
  day: string;
  startTime: string; // in 24h format "HH:MM"
  endTime: string; // in 24h format "HH:MM"
  subjectId?: string;
  isBreak?: boolean;
  isFreePeriod?: boolean;
  semesterId: string;
  week_id: string;
  teacher_name: string;
  classType?: "lecture" | "lab"; // Added class type
  batches?: BatchInfo[]; // Added batches for lab sessions
};

// Type for batch information
type BatchInfo = {
  map(arg0: (batch: any) => JSX.Element): import("react").ReactNode;
  id: string;
  name: string;
  teacher_name: string;
  location?: string;
  subjectId?: string; // Add subject ID to allow different subjects per batch
};

// Type for college hours
type CollegeHours = {
  startTime: string; // in 24h format "HH:MM"
  endTime: string; // in 24h format "HH:MM"
  semesterId: string; // Added semester ID
};

// Type for holiday
type Holiday = {
  day: string;
  semesterId: string; // Added semester ID
};

// Type for semester
type Semester = {
  id: string;
  name: string;
};

// Add mock data for batches
const defaultBatches: { id: string; name: string }[] = [
  { id: "batch1", name: "Batch A" },
  { id: "batch2", name: "Batch B" },
  { id: "batch3", name: "Batch C" },
];

export default function Page() {
  const router = useRouter();
  const [subjectColors, setcolor] = useState<Record<string, string>>({});
  const [sampleTimetableData, setSampleData] = useState<
    Record<string, TimetableEntry[]>
  >({});
  const [defaultBatches, setBatches] = useState<{ id: string; name: string }[]>(
    []
  );
  const { division_id } = useAppSelector((state) => state.timetable);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const {
    sem,
  }: {
    sem: {
      id: any;
      name: string;
      current: boolean;
    }[];
  } = useAppSelector((state) => state.timetable);
  const id = sem.map((sem) => {
    if (sem?.current == true) {
      return sem.id;
    }
  });

  const [semesters, setSemesters] = useState<
    {
      name: string;
      id: any;
      current: boolean;
    }[]
  >(sem);

  const dispatch = useAppDispatch();
  const [timeTableData, setTimeTableData] = useState<any>([]);

  const [selectedSemester, setSelectedSemester] = useState(id[0]);
  const [week_id, setWeekid] = useState("");

  const { toast } = useToast();

  async function fetchTimeTable() {
    const response = await axios.get(
      `/api/fetch-time-table?division_id=${division_id}`
    );

    dispatch(timeTableActions.addtimetable(response.data.data));
    setTimeTableData(response.data.data);

    return response.data;
  }
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };
  useEffect(() => {
    timeTableData?.semesters?.map((sem: any) => {
      if (sem._id.toString() === selectedSemester) {
        const data: any = [];
        const slot: any = [];
        const batches: any = [];
        setWeekid(sem.time_table.week._id);
        sem.batch.map((b: any) => {
          const obj: { id: string; name: string } = {
            id: b._id,
            name: b.batch_name,
          };
          batches.push(obj);
        });
        sem.time_table.week.days.map((d: any) => {
          d.slots.map((s: any) => {
            if (s.is_lab) {
              const obj: {
                id: string;
                day: string;
                startTime: string;
                endTime: string;
                semesterId: string;
                classType: string;
                batches: BatchInfo[];
                week_id: string;
              } = {
                id: s._id,
                day: d.day_name,
                startTime: convertTo24Hour(s.start_time),
                endTime: convertTo24Hour(s.end_time),
                semesterId: s.semester_id,
                classType: "lab",
                week_id: sem.time_table.week._id,
                batches: s.lab.map((l: any) => {
                  return {
                    id: l.batch_id._id,
                    name: l.batch_id.batch_name,
                    teacher_name: l.teacher_name,
                    subjectId: l.subject_id,
                    location: l.lab_location,
                  };
                }),
              };
              slot.push(obj);
            } else {
              const obj: {
                id: string;
                day: string;
                startTime: string;
                endTime: string;
                subjectId: string;
                semesterId: string;
                classType: string;
                teacher_name: string;
                week_id: string;
              } = {
                id: s._id,
                day: d.day_name,
                week_id: sem.time_table.week._id,
                startTime: convertTo24Hour(s.start_time),
                endTime: convertTo24Hour(s.end_time),
                subjectId: s.subject_id,
                teacher_name: s.teacher_name,
                semesterId: s.semester_id,
                classType: "lecture",
              };
              slot.push(obj);
            }
          });
        });
        sem.subjects.map((se: any) => {
          const obj: {
            id: string;
            name: string;
            teacher_name: string;
            teacher_id: string;
          } = {
            id: se._id,
            name: se.subject_name,
            teacher_name: se.teacher_id.name,
            teacher_id: se.teacher_id._id,
          };
          data.push(obj);
        });

        setSubjects(data);

        setBatches(batches);
        setSampleData({ [`${selectedSemester}`]: slot });

        const dynamicSubjectColorMap = subjects.reduce(
          (acc, subject, index) => {
            acc[subject.id] = getRandomColor(index);
            return acc;
          },
          {} as Record<string, string>
        );
        setcolor(dynamicSubjectColorMap);
      }
    });
  }, [timeTableData]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["timetable"],
    queryFn: fetchTimeTable,
  });

  // College hours by semester
  const [collegeHoursBySemester, setCollegeHoursBySemester] = useState<
    Record<string, CollegeHours>
  >({}); // Start with an empty object

  useEffect(() => {
    if (!semesters || semesters.length === 0) return;

    const newCollegeHours = semesters.reduce((acc, semester) => {
      acc[semester.id] = {
        startTime: "08:00",
        endTime: "17:00",
        semesterId: semester.id,
      };
      return acc;
    }, {} as Record<string, CollegeHours>);

    setCollegeHoursBySemester(newCollegeHours);
  }, [semesters]); // Runs when `semesters` changes

  // Get current college hours based on selected semester
  const collegeHours = selectedSemester
    ? collegeHoursBySemester[selectedSemester]
    : undefined;

  // Timetable entries by semester
  const [timetableBySemester, setTimetableBySemester] =
    useState<Record<string, TimetableEntry[]>>(sampleTimetableData);
  useEffect(() => {
    setTimetableBySemester(sampleTimetableData);
  }, [sampleTimetableData]);
  // Get current timetable based on selected semester
  const timetable = selectedSemester
    ? timetableBySemester[selectedSemester] || []
    : [];

  // Holidays by semester
  const [holidaysBySemester, setHolidaysBySemester] = useState<
    Record<string, Holiday[]>
  >(
    semesters.reduce((acc, semester) => {
      acc[semester.id] = [];
      return acc;
    }, {} as Record<string, Holiday[]>)
  );

  // Get current holidays based on selected semester
  const holidays = selectedSemester
    ? holidaysBySemester[selectedSemester] || []
    : [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollegeHoursDialogOpen, setIsCollegeHoursDialogOpen] =
    useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimetableEntry>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [old, setOld] = useState<Partial<TimetableEntry> | undefined>(
    undefined
  );
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false);
  const [newSemester, setNewSemester] = useState<Partial<Semester>>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Time slot interval in minutes (for grid display)
  const timeSlotInterval = 30;

  // Generate time slots based on college hours
  const generateTimeSlots = () => {
    const slots: string[] = [];
    if (!collegeHours) return slots;

    const [startHour, startMinute] = collegeHours.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = collegeHours.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      slots.push(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`
      );

      currentMinute += timeSlotInterval;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Format time for display (convert from 24h to 12h format)
  const formatTime = (time24h: string) => {
    const [hours, minutes] = time24h.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Format time range for display
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
  };

  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
    }
  };

  // Handle form input changes
  const handleInputChange = (
    field: keyof TimetableEntry,
    value: string | boolean | undefined | BatchInfo[]
  ) => {
    // Special handling for classType
    if (field === "classType") {
      const classType = value as "lecture" | "lab" | undefined;

      // Create updated entry with the new class type
      const updatedEntry = {
        ...currentEntry,
        classType,
        // Reset batches based on class type
        batches: classType === "lab" ? currentEntry.batches || [] : [],
      };

      setCurrentEntry(updatedEntry);

      // If switching to lab and no batches exist, add an initial batch after the state update
      if (
        classType === "lab" &&
        (!updatedEntry.batches || updatedEntry.batches.length === 0)
      ) {
        setTimeout(addBatch, 0);
      }

      return;
    }

    // For boolean fields, ensure they're properly set
    if (field === "isBreak" || field === "isFreePeriod") {
      setCurrentEntry({
        ...currentEntry,
        [field]: Boolean(value),
      });
    } else {
      // Ensure we never set undefined for controlled inputs
      const safeValue = value === undefined ? "" : value;
      setCurrentEntry({
        ...currentEntry,
        [field]: safeValue,
      });
    }
  };

  // Add a function to update batch information
  const updateBatchInfo = (
    batchIndex: number,
    field: keyof BatchInfo,
    value: string
  ) => {
    if (!currentEntry.batches) return;

    setCurrentEntry((prevEntry) => {
      const updatedBatches = (prevEntry.batches ?? []).map((batch, index) =>
        index === batchIndex ? { ...batch, [field]: value } : batch
      );

      return { ...prevEntry, batches: updatedBatches };
    });
  };

  // Add a function to add a batch
  const addBatch = () => {
    const newBatch: BatchInfo = {
      id: "",
      name: "",
      subjectId: "",
      teacher_name: "",
      location: "",
      map: (arg0: (batch: any) => JSX.Element): import("react").ReactNode => {
        throw new Error("Function not implemented.");
      },
    };

    setCurrentEntry({
      ...currentEntry,
      batches: [...(currentEntry.batches || []), newBatch],
    });
  };

  // Add a function to remove a batch
  const removeBatch = (batchIndex: number) => {
    if (!currentEntry.batches) return;

    const updatedBatches = [...currentEntry.batches];
    updatedBatches.splice(batchIndex, 1);

    setCurrentEntry({
      ...currentEntry,
      batches: updatedBatches,
    });
  };

  // Check if a time slot is already occupied
  const isTimeSlotOccupied = (
    day: string,
    startTime: string,
    endTime: string,
    entryId?: string
  ) => {
    // Check against all existing entries
    return timetable.some((entry) => {
      if (entryId && entry.id === entryId) return false;
      if (entry.day !== day) return false;

      // Parse times to minutes for easier comparison
      const entryStartMinutes = timeToMinutes(entry.startTime);
      const entryEndMinutes = timeToMinutes(entry.endTime);
      const newStartMinutes = timeToMinutes(startTime);
      const newEndMinutes = timeToMinutes(endTime);

      // Check for overlap
      return (
        (newStartMinutes < entryEndMinutes &&
          newEndMinutes > entryStartMinutes) ||
        (entryStartMinutes < newEndMinutes && entryEndMinutes > newStartMinutes)
      );
    });
  };

  // Convert time string to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Update the addEntry function to handle class type and batches
  const addEntry = async () => {
    if (!currentEntry.day || !currentEntry.startTime || !currentEntry.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least day, start time, and end time.",
        variant: "destructive",
      });
      return;
    }

    // Validate times
    const startMinutes = timeToMinutes(currentEntry.startTime!);
    const endMinutes = timeToMinutes(currentEntry.endTime!);

    if (startMinutes >= endMinutes) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    // If it's not a break or free period, require class type
    if (
      !currentEntry.isBreak &&
      !currentEntry.isFreePeriod &&
      !currentEntry.classType
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a class type (lecture or lab).",
        variant: "destructive",
      });
      return;
    }

    // If it's a lecture and not a break or free period, require subject
    if (
      !currentEntry.isBreak &&
      !currentEntry.isFreePeriod &&
      currentEntry.classType === "lecture" &&
      !currentEntry.subjectId
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a subject for this lecture.",
        variant: "destructive",
      });
      return;
    }

    // If it's a lab, require at least one batch with a location and subject
    if (
      !currentEntry.isBreak &&
      !currentEntry.isFreePeriod &&
      currentEntry.classType === "lab" &&
      (!currentEntry.batches || currentEntry.batches.length === 0)
    ) {
      toast({
        title: "Missing Information",
        description: "Please add at least one batch for this lab session.",
        variant: "destructive",
      });
      return;
    }

    // Validate that each batch has a subject and location
    if (
      !currentEntry.isBreak &&
      !currentEntry.isFreePeriod &&
      currentEntry.classType === "lab" &&
      currentEntry.batches
    ) {
      const invalidBatch = currentEntry.batches.find(
        (batch) => !batch.subjectId || !batch.location
      );
      if (invalidBatch) {
        toast({
          title: "Missing Information",
          description: `Please provide subject and location for batch "${invalidBatch.name}".`,
          variant: "destructive",
        });
        return;
      }
    }

    if (
      isTimeSlotOccupied(
        currentEntry.day!,
        currentEntry.startTime!,
        currentEntry.endTime!,
        currentEntry.id
      )
    ) {
      toast({
        title: "Time Slot Conflict",
        description:
          "This time slot overlaps with an existing entry. Please choose a different time or day.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: TimetableEntry = {
      id:
        isEditing && currentEntry.id ? currentEntry.id : `entry-${Date.now()}`,
      day: currentEntry.day!,
      startTime: currentEntry.startTime!,
      endTime: currentEntry.endTime!,
      subjectId: currentEntry.subjectId,
      isBreak: Boolean(currentEntry.isBreak),
      isFreePeriod: Boolean(currentEntry.isFreePeriod),
      semesterId: selectedSemester || "",
      teacher_name: "",
      week_id: currentEntry.week_id || week_id,
      classType: currentEntry.classType,
      batches: currentEntry.batches,
    };

    if (isEditing) {
      const updatedTimetable = timetable.map((entry) =>
        entry.id === newEntry.id ? newEntry : entry
      );

      setTimetableBySemester({
        ...timetableBySemester,
        [selectedSemester || ""]: updatedTimetable,
      });
      toast({
        title: "Entry Updated",
        description: "The timetable entry has been updated successfully.",
      });
    } else {
      const updatedTimetable = [...timetable, newEntry];

      const response = await axios.post("/api/add-slot", newEntry);
      if (response.data.message == "Slot added successfully") {
        router.replace("/division-dashboard/time-table");
      }
      setTimetableBySemester({
        ...timetableBySemester,
        [selectedSemester || ""]: updatedTimetable,
      });
      toast({
        title: "Entry Added",
        description: "A new entry has been added to the timetable.",
      });
    }

    setIsDialogOpen(false);
    setCurrentEntry({});
    setIsEditing(false);
  };

  // Edit an existing entry
  const editEntry = (entry: TimetableEntry) => {
    // Create a copy with all fields defined to prevent controlled/uncontrolled switching
    const entryCopy = {
      ...entry,
      day: entry.day || "",
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      subjectId: entry.subjectId || "",
      isBreak: entry.isBreak || false,
      isFreePeriod: entry.isFreePeriod || false,
      classType: entry.classType as "lecture" | "lab" | undefined,
      batches: entry.batches || [],
    };
    setOld(entryCopy);

    setCurrentEntry(entryCopy);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Confirm delete for an entry
  const confirmDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Delete an entry
  const deleteEntry = async () => {
    if (!entryToDelete) return;

    const deleted = timetable.filter((e) => e.id === entryToDelete);

    const response = await axios.post("/api/remove-slot", deleted);
    if (response.data.message == "Entry deleted successfully") {
      router.replace("/division-dashboard/time-table");
    }

    const updatedTimetable = timetable.filter(
      (entry) => entry.id !== entryToDelete
    );
    setTimetableBySemester({
      ...timetableBySemester,
      [selectedSemester]: updatedTimetable,
    });

    toast({
      title: "Entry Deleted",
      description: "The timetable entry has been removed.",
    });

    setIsDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  // Save the complete timetable
  const saveTimetable = () => {
    // Here you would typically send the timetable data to your backend

    toast({
      title: "Timetable Saved",
      description: `Your timetable for ${getSemesterName(
        selectedSemester
      )} has been saved successfully.`,
    });
  };

  // Open dialog for adding a new entry
  const openAddDialog = (day?: string, startTime?: string) => {
    // If a day is marked as holiday, don't allow adding entries
    if (day && holidays.some((holiday) => holiday.day === day)) {
      toast({
        title: "Holiday",
        description: `${day} is marked as a holiday. No classes can be scheduled.`,
      });
      return;
    }

    let endTime = "";
    if (startTime) {
      // Calculate a default end time (1 hour after start)
      const [hours, minutes] = startTime.split(":").map(Number);
      const endHour = hours + 1;
      endTime = `${endHour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }

    // Set all form fields with default values to ensure controlled inputs
    setCurrentEntry({
      day: day || "",
      startTime: startTime || "",
      endTime: endTime || "",
      isFreePeriod: false,
      isBreak: false,
      semesterId: selectedSemester,
      classType: undefined, // Default to undefined so user must select
      subjectId: "",
      batches: [], // Initialize empty batches array
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Update college hours
  const updateCollegeHours = () => {
    // Validate times
    const startMinutes = collegeHours
      ? timeToMinutes(collegeHours.startTime)
      : 0;
    const endMinutes = collegeHours ? timeToMinutes(collegeHours.endTime) : 0;

    if (startMinutes >= endMinutes) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setCollegeHoursBySemester({
      ...collegeHoursBySemester,
      [selectedSemester]: {
        ...collegeHours,
        semesterId: selectedSemester,
      },
    });

    toast({
      title: "College Hours Updated",
      description: collegeHours
        ? `College hours for ${getSemesterName(
            selectedSemester
          )} set to ${formatTime(collegeHours.startTime)} - ${formatTime(
            collegeHours.endTime
          )}`
        : "College hours not set",
    });

    setIsCollegeHoursDialogOpen(false);
  };

  // Toggle holiday status for a day
  const toggleHoliday = (day: string) => {
    const updatedHolidays = [...holidays];
    const existingIndex = updatedHolidays.findIndex(
      (holiday) => holiday.day === day
    );

    if (existingIndex >= 0) {
      updatedHolidays.splice(existingIndex, 1);
      toast({
        title: "Holiday Removed",
        description: `${day} is no longer marked as a holiday for ${getSemesterName(
          selectedSemester
        )}.`,
      });
    } else {
      updatedHolidays.push({ day, semesterId: selectedSemester });
      toast({
        title: "Holiday Added",
        description: `${day} is now marked as a holiday for ${getSemesterName(
          selectedSemester
        )}.`,
      });
    }

    setHolidaysBySemester({
      ...holidaysBySemester,
      [selectedSemester]: updatedHolidays,
    });

    setIsHolidayDialogOpen(false);
  };

  // Get subject name by ID
  const getSubjectName = (id?: string) => {
    if (!id) return "";
    return (
      subjects.find((subject) => subject.id === id)?.name || "Unknown Subject"
    );
  };

  // Get semester name by ID
  const getSemesterName = (id: string) => {
    return (
      semesters.find((semester) => semester.id === id)?.name ||
      "Unknown Semester"
    );
  };

  // Get entries for a specific day and time slot
  const getEntriesForTimeSlot = (day: string, timeSlot: string) => {
    const slotMinutes = timeToMinutes(timeSlot);

    return timetable.filter((entry) => {
      if (entry.day !== day) return false;

      const entryStartMinutes = timeToMinutes(entry.startTime);
      const entryEndMinutes = timeToMinutes(entry.endTime);

      return slotMinutes >= entryStartMinutes && slotMinutes < entryEndMinutes;
    });
  };

  // Check if a time slot is the start of an entry
  const isStartOfEntry = (day: string, timeSlot: string) => {
    return timetable.some(
      (entry) => entry.day === day && entry.startTime === timeSlot
    );
  };

  // Calculate how many time slots an entry spans
  const calculateRowSpan = (entry: TimetableEntry) => {
    const startMinutes = timeToMinutes(entry.startTime);
    const endMinutes = timeToMinutes(entry.endTime);
    const duration = endMinutes - startMinutes;
    // Use Math.ceil to ensure we cover all time slots, even partial ones
    return Math.ceil(duration / timeSlotInterval);
  };

  // Check if a day is a holiday
  const isDayHoliday = (day: string) => {
    return holidays.some((holiday) => holiday.day === day);
  };

  // Handle semester change
  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemester(semesterId);
    setActiveTab("view"); // Reset to view tab when changing semester
  };

  const [hasFetched, setHasFetched] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="mr-2 h-11 w-11 animate-spin" />
      </div>
    );
  }

 

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Timetable
          </h1>
          <p className="text-muted-foreground">
            Create a flexible timetable with custom time slots, breaks, and
            holidays
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {getSemesterName(selectedSemester)} Timetable
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCollegeHoursDialogOpen(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              College Hours
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsHolidayDialogOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Holidays
            </Button>
            <TabsList>
              <TabsTrigger value="view">View Timetable</TabsTrigger>
              <TabsTrigger value="manage">Manage Entries</TabsTrigger>
            </TabsList>
            <Button onClick={saveTimetable}>
              <Save className="mr-2 h-4 w-4" />
              Save Timetable
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium">College Hours:</div>
                  <div className="text-lg">
                    {collegeHours ? formatTime(collegeHours.startTime) : "N/A"}{" "}
                    - {collegeHours ? formatTime(collegeHours.endTime) : "N/A"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {holidays.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Holidays:</span>
                      {holidays.map((holiday) => (
                        <Badge
                          key={holiday.day}
                          variant="outline"
                          className="bg-red-50 text-red-800 border-red-300"
                        >
                          {holiday.day}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No holidays set
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="view" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                Weekly Schedule - {getSemesterName(selectedSemester)}
              </CardTitle>
              <CardDescription>
                View your complete weekly timetable with custom time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted font-medium text-left min-w-[100px]">
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className={`border p-2 font-medium text-left min-w-[150px] ${
                            isDayHoliday(day)
                              ? "bg-red-50 text-red-800"
                              : "bg-muted"
                          }`}
                        >
                          {day}
                          {isDayHoliday(day) && (
                            <span className="ml-2 text-xs font-normal">
                              (Holiday)
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot, index) => (
                      <tr key={timeSlot}>
                        <td className="border p-2 font-medium text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatTime(timeSlot)}
                          </div>
                        </td>
                        {days.map((day) => {
                          // Skip rendering for holidays
                          if (isDayHoliday(day)) {
                            return (
                              <td
                                key={`${day}-${timeSlot}`}
                                className="border p-2 bg-red-50 text-red-800"
                              >
                                {index === 0 && (
                                  <div className="flex items-center justify-center h-full text-center p-4">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    <span>Holiday</span>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          const entries = getEntriesForTimeSlot(day, timeSlot);

                          // If this time slot is the start of an entry, render it with rowspan
                          if (isStartOfEntry(day, timeSlot)) {
                            const entry = entries[0];
                            const rowSpan = calculateRowSpan(entry);

                            let bgClass = "";
                            let content = null;

                            if (entry.isBreak) {
                              bgClass = "bg-gray-100 border-gray-300";
                              content = (
                                <>
                                  <div className="font-medium flex items-center">
                                    <Coffee className="h-4 w-4 mr-2" />
                                    Break
                                  </div>
                                  <div className="text-xs mt-1">
                                    {formatTimeRange(
                                      entry.startTime,
                                      entry.endTime
                                    )}
                                  </div>
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    {formatDuration(
                                      calculateDuration(
                                        entry.startTime,
                                        entry.endTime
                                      )
                                    )}
                                  </div>
                                  <div className="flex gap-1 mt-2">
                                    {/* <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button> */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() =>
                                        confirmDeleteEntry(entry.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </>
                              );
                            } else if (entry.isFreePeriod) {
                              bgClass = "bg-gray-50 border-gray-200";
                              content = (
                                <>
                                  <div className="font-medium flex items-center">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Free Period
                                  </div>
                                  <div className="text-xs mt-1">
                                    {formatTimeRange(
                                      entry.startTime,
                                      entry.endTime
                                    )}
                                  </div>
                                  <div className="text-xs mt-1 text-muted-foreground">
                                    {formatDuration(
                                      calculateDuration(
                                        entry.startTime,
                                        entry.endTime
                                      )
                                    )}
                                  </div>
                                  <div className="flex gap-1 mt-2">
                                    {/* <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button> */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() =>
                                        confirmDeleteEntry(entry.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </>
                              );
                            } else {
                              bgClass =
                                subjectColors?.[entry.subjectId!] ??
                                "bg-gray-100 border-gray-300";

                              if (entry.classType === "lab") {
                                content = (
                                  <>
                                    <div className="font-medium">
                                      {getSubjectName(entry.subjectId)}
                                    </div>
                                    <div className="flex items-center text-xs mt-1">
                                      <Badge
                                        variant="outline"
                                        className="mr-1 bg-yellow-50 text-yellow-800 border-yellow-300"
                                      >
                                        Lab
                                      </Badge>
                                      <span>
                                        {formatTimeRange(
                                          entry.startTime,
                                          entry.endTime
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-xs mt-1 text-muted-foreground">
                                      {formatDuration(
                                        calculateDuration(
                                          entry.startTime,
                                          entry.endTime
                                        )
                                      )}
                                    </div>

                                    {entry.batches &&
                                      entry.batches.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          <div className="text-xs font-medium">
                                            Batches:
                                          </div>
                                          {entry.batches.map((batch) => (
                                            <div
                                              key={batch.id}
                                              className="text-xs p-1 bg-background/50 rounded"
                                            >
                                              <div className="font-medium">
                                                {batch.name} (prof.
                                                {batch.teacher_name})
                                              </div>
                                              <div className="flex justify-between">
                                                {batch.subjectId &&
                                                  batch.subjectId !==
                                                    entry.subjectId && (
                                                    <span className="text-primary">
                                                      {getSubjectName(
                                                        batch.subjectId
                                                      )}
                                                    </span>
                                                  )}
                                                {batch.location && (
                                                  <span className="text-muted-foreground">
                                                    {batch.location}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    <div className="flex gap-1 mt-2">
                                      {/* <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button> */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() =>
                                          confirmDeleteEntry(entry.id)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </>
                                );
                              } else {
                                content = (
                                  <>
                                    <div className="font-medium">
                                      {getSubjectName(entry.subjectId)} (prof.
                                      {entry.teacher_name})
                                    </div>
                                    <div className="flex items-center text-xs mt-1">
                                      <Badge
                                        variant="outline"
                                        className="mr-1 bg-blue-50 text-blue-800 border-blue-300"
                                      >
                                        Lecture
                                      </Badge>
                                    </div>
                                    <div className="text-xs mt-1">
                                      {formatTimeRange(
                                        entry.startTime,
                                        entry.endTime
                                      )}
                                    </div>
                                    <div className="text-xs mt-1 text-muted-foreground">
                                      {formatDuration(
                                        calculateDuration(
                                          entry.startTime,
                                          entry.endTime
                                        )
                                      )}
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                      {/* <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button> */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() =>
                                          confirmDeleteEntry(entry.id)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </>
                                );
                              }
                            }

                            return (
                              <td
                                key={`${day}-${timeSlot}`}
                                className="border p-2"
                                rowSpan={rowSpan}
                              >
                                <div
                                  className={`p-2 rounded border ${bgClass}`}
                                >
                                  {content}
                                </div>
                              </td>
                            );
                          }

                          // If this time slot is in the middle of an entry, don't render a cell
                          if (
                            entries.length > 0 &&
                            !isStartOfEntry(day, timeSlot)
                          ) {
                            const currentSlotMinutes = timeToMinutes(timeSlot);
                            const shouldSkip = entries.some((entry) => {
                              const entryStartMinutes = timeToMinutes(
                                entry.startTime
                              );
                              const entryEndMinutes = timeToMinutes(
                                entry.endTime
                              );
                              return (
                                currentSlotMinutes > entryStartMinutes &&
                                currentSlotMinutes < entryEndMinutes
                              );
                            });

                            if (shouldSkip) {
                              return null; // Don't render anything for this cell
                            }
                          }

                          // If no entry, render an empty cell with add button
                          return (
                            <td
                              key={`${day}-${timeSlot}`}
                              className="border p-2"
                            >
                              <div className="h-full w-full min-h-[40px] flex items-center justify-center text-muted-foreground text-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-full w-full"
                                  onClick={() => openAddDialog(day, timeSlot)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total entries: {timetable.length} for{" "}
                {getSemesterName(selectedSemester)}
              </div>
              {/* <Button onClick={() => openAddDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Entry
              </Button> */}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Timetable Entries - {getSemesterName(selectedSemester)}
              </CardTitle>
              <CardDescription>
                Add, edit, or remove timetable entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  {/* <Button onClick={() => openAddDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Entry
                  </Button> */}
                </div>

                {timetable.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Entries Yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Start by adding your first timetable entry for{" "}
                      {getSemesterName(selectedSemester)}.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {timetable.map((entry) => {
                      let borderClass = "";
                      let title = "";
                      let description = "";

                      if (entry.isBreak) {
                        borderClass = "border-l-gray-400";
                        title = "Break";
                        description = "Break Time";
                      } else if (entry.isFreePeriod) {
                        borderClass = "border-l-gray-300";
                        title = "Free Period";
                        description = "Available for scheduling";
                      } else {
                        borderClass = `border-l-4 ${
                          subjectColors?.[entry.subjectId!] ??
                          "border-l-gray-300"
                        }`;
                        title = getSubjectName(entry.subjectId);
                        description =
                          entry.classType === "lecture"
                            ? `Lecture - Prof. ${entry.teacher_name} `
                            : `Lab - ${entry.batches?.length || 0} Batches`;
                      }

                      return (
                        <Card
                          key={entry.id}
                          className={`overflow-hidden ${borderClass}`}
                        >
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">
                              {entry.isBreak ? (
                                <div className="flex items-center">
                                  <Coffee className="h-4 w-4 mr-2" />
                                  {title}
                                </div>
                              ) : entry.isFreePeriod ? (
                                <div className="flex items-center">
                                  <Edit className="h-4 w-4 mr-2" />
                                  {title}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  {title}
                                  {entry.classType && (
                                    <Badge
                                      variant="outline"
                                      className={`ml-2 ${
                                        entry.classType === "lecture"
                                          ? "bg-blue-50 text-blue-800 border-blue-300"
                                          : "bg-yellow-50 text-yellow-800 border-yellow-300"
                                      }`}
                                    >
                                      {entry.classType === "lecture"
                                        ? "Lecture"
                                        : "Lab"}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardTitle>
                            <div className="flex gap-1">
                              {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editEntry(entry)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button> */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => confirmDeleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                            <CardDescription className="mt-1">
                              {description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm">
                              <div className="flex items-center mb-1">
                                <span className="font-medium w-20">Day:</span>
                                <span>{entry.day}</span>
                              </div>
                              <div className="flex items-center mb-1">
                                <span className="font-medium w-20">Time:</span>
                                <span>
                                  {formatTimeRange(
                                    entry.startTime,
                                    entry.endTime
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center mb-1">
                                <span className="font-medium w-20">
                                  Duration:
                                </span>
                                <span>
                                  {formatDuration(
                                    calculateDuration(
                                      entry.startTime,
                                      entry.endTime
                                    )
                                  )}
                                </span>
                              </div>

                              {entry.classType === "lab" &&
                                entry.batches &&
                                entry.batches.length > 0 && (
                                  <div className="mt-2">
                                    <div className="font-medium mb-1">
                                      Batches:
                                    </div>
                                    <div className="space-y-1 pl-2">
                                      {entry.batches.map((batch) => (
                                        <div
                                          key={uuidv4()}
                                          className="text-xs p-1 bg-muted rounded flex justify-between"
                                        >
                                          <span>{batch.name}</span>
                                          {batch.subjectId &&
                                            batch.subjectId.toString() !==
                                              entry.subjectId?.toString() && (
                                              <span className="text-primary">
                                                {getSubjectName(
                                                  batch.subjectId
                                                )}{" "}
                                                (Prof.{batch.teacher_name})
                                              </span>
                                            )}
                                          {batch.location && (
                                            <span className="text-muted-foreground">
                                              {batch.location}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for adding/editing entries */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Timetable Entry" : "Add Timetable Entry"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details for this timetable slot."
                : "Fill in the details to add a new entry to your timetable."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <Select
                value={currentEntry.day || ""}
                onValueChange={(value) => handleInputChange("day", value)}
                disabled={isEditing}
              >
                <SelectTrigger id="day" className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days
                    .filter((day) => !isDayHoliday(day))
                    .map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="startTime"
                  type="time"
                  value={currentEntry.startTime || ""}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="endTime"
                  type="time"
                  value={currentEntry.endTime || ""}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entryType" className="text-right">
                Entry Type
              </Label>
              <div className="col-span-3 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isBreak"
                    checked={Boolean(currentEntry.isBreak)}
                    onCheckedChange={(checked) => {
                      handleInputChange("isBreak", checked);
                      if (checked) {
                        handleInputChange("isFreePeriod", false);
                        handleInputChange("classType", undefined);
                        handleInputChange("subjectId", "");
                        handleInputChange("batches", []);
                      }
                    }}
                  />
                  <Label htmlFor="isBreak">Break Time</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFreePeriod"
                    checked={Boolean(currentEntry.isFreePeriod)}
                    onCheckedChange={(checked) => {
                      handleInputChange("isFreePeriod", checked);
                      if (checked) {
                        handleInputChange("isBreak", false);
                        handleInputChange("classType", undefined);
                        handleInputChange("subjectId", "");
                        handleInputChange("batches", []);
                      }
                    }}
                  />
                  <Label htmlFor="isFreePeriod">Free Period</Label>
                </div>
              </div>
            </div>

            {!currentEntry.isBreak && !currentEntry.isFreePeriod && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="classType" className="text-right">
                    Class Type
                  </Label>
                  <Select
                    value={currentEntry.classType || ""}
                    onValueChange={(value) => {
                      // Convert the string value to the proper type
                      const classType = value as "lecture" | "lab";

                      // Create a new entry object with updated fields
                      const updatedEntry = {
                        ...currentEntry,
                        classType,
                        // Reset fields based on class type
                        batches:
                          classType === "lecture"
                            ? []
                            : currentEntry.batches?.length
                            ? currentEntry.batches
                            : [],
                      };

                      // Update the entire entry state at once
                      setCurrentEntry(updatedEntry);

                      // If it's a lab and there are no batches, add an initial batch after the state update
                      if (
                        classType === "lab" &&
                        (!updatedEntry.batches ||
                          updatedEntry.batches.length === 0)
                      ) {
                        setTimeout(addBatch, 0);
                      }
                    }}
                  >
                    <SelectTrigger id="classType" className="col-span-3">
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">
                        Lecture (All Students)
                      </SelectItem>
                      <SelectItem value="lab">Lab (Batches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentEntry.classType && (
                  <>
                    {currentEntry.classType === "lecture" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                          Subject
                        </Label>
                        <Select
                          value={currentEntry.subjectId || ""}
                          onValueChange={(value) =>
                            handleInputChange("subjectId", value)
                          }
                        >
                          <SelectTrigger id="subject" className="col-span-3">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {currentEntry.classType === "lab" && (
                  <div className="grid grid-cols-4 gap-4">
                    <Label className="text-right pt-2">Batches</Label>
                    <div className="col-span-3 space-y-4">
                      {currentEntry.batches &&
                      currentEntry.batches.length > 0 ? (
                        <div className="space-y-4">
                          {currentEntry.batches?.map(
                            (batch: BatchInfo, index: number) => (
                              <Card key={uuidv4()} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">
                                    Batch {index + 1}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => removeBatch(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      Remove batch
                                    </span>
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-4 gap-2 items-center">
                                    <Label
                                      htmlFor={`batch-${index}-select`}
                                      className="text-right text-xs"
                                    >
                                      Select Batch
                                    </Label>
                                    <Select
                                      value={batch.id}
                                      onValueChange={(value) => {
                                        const selectedBatch =
                                          defaultBatches.find(
                                            (b) =>
                                              b.id.toString() ===
                                              value.toString()
                                          );
                                        if (selectedBatch) {
                                          updateBatchInfo(index, "id", value);
                                          updateBatchInfo(
                                            index,
                                            "name",
                                            selectedBatch.name
                                          );
                                        }
                                      }}
                                    >
                                      <SelectTrigger
                                        id={`batch-${index}-select`}
                                        className="col-span-3"
                                      >
                                        <SelectValue placeholder="Select batch" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {defaultBatches.map((b) => (
                                          <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 items-center">
                                    <Label
                                      htmlFor={`batch-${index}-subject`}
                                      className="text-right text-xs"
                                    >
                                      Select Subject
                                    </Label>
                                    <Select
                                      value={batch.subjectId || ""}
                                      onValueChange={(value) =>
                                        updateBatchInfo(
                                          index,
                                          "subjectId",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger
                                        id={`batch-${index}-subject`}
                                        className="col-span-3"
                                      >
                                        <SelectValue placeholder="Select subject" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {subjects.map((subject) => (
                                          <SelectItem
                                            key={subject.id}
                                            value={subject.id}
                                          >
                                            {subject.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 items-center">
                                    <Label
                                      htmlFor={`batch-${index}-location`}
                                      className="text-right text-xs"
                                    >
                                      Batch Location
                                    </Label>
                                    <Input
                                      id={`batch-${index}-location`}
                                      value={batch.location || ""}
                                      className="col-span-3"
                                      placeholder="Lab room, etc."
                                      onChange={(e) =>
                                        updateBatchInfo(
                                          index,
                                          "location",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </Card>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center p-4 border rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">
                            No batches added yet
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addBatch}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Batch
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addEntry}>{isEditing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for setting college hours */}
      <Dialog
        open={isCollegeHoursDialogOpen}
        onOpenChange={setIsCollegeHoursDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              College Hours - {getSemesterName(selectedSemester)}
            </DialogTitle>
            <DialogDescription>
              Set the start and end times for your college day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collegeStartTime" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="collegeStartTime"
                  type="time"
                  value={collegeHours ? collegeHours.startTime : ""}
                  onChange={(e) =>
                    setCollegeHoursBySemester({
                      ...collegeHoursBySemester,
                      [selectedSemester]: {
                        ...collegeHoursBySemester[selectedSemester],
                        startTime: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collegeEndTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="collegeEndTime"
                  type="time"
                  value={collegeHours ? collegeHours.endTime : ""}
                  onChange={(e) =>
                    setCollegeHoursBySemester({
                      ...collegeHoursBySemester,
                      [selectedSemester]: {
                        ...collegeHoursBySemester[selectedSemester],
                        endTime: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCollegeHoursDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateCollegeHours}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for setting holidays */}
      <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Manage Holidays - {getSemesterName(selectedSemester)}
            </DialogTitle>
            <DialogDescription>
              Mark days as holidays to exclude them from the timetable.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between">
                <Label htmlFor={`holiday-${day}`} className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {day}
                </Label>
                <Switch
                  id={`holiday-${day}`}
                  checked={!!holidays.some((holiday) => holiday.day === day)}
                  onCheckedChange={() => toggleHoliday(day)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHolidayDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting entries */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected timetable entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEntry}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
