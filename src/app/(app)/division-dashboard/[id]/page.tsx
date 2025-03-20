"use client";
import React from "react";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userActions } from "@/store/slice/user";
import { useAppDispatch } from "@/hooks/hooks";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

import { useRouter } from "next/navigation";

export default function Page() {
  const param = useParams();

  const student_id = param.id?.toString().split("sm")[0];
  const semester_id = param.id?.toString().split("sm")[1];

  const dispatch = useAppDispatch();
  const router = useRouter();
  interface Semester {
    Semester_id: string;
    Semester_name: string;
    start_date: string;
    end_date: string;
  }

  const [sem, setSem] = useState<Semester[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>([]);
  const [monthlyData, setMonthlyData] = useState<any>([]);
  const [subject, setSubject] = useState<any>([]);
  const [subjects, setSubjects] = useState<any>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [attendance, setAttendance] = useState<any>([]);
  const [totala, setTotala] = useState<any>([]);

  const calculateSemesterInfo = (
    startDateStr: string,
    endDateStr: string,
    id: string
  ) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const today = new Date();

    // Calculate total weeks
    const totalWeeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Calculate the current week
    let currentWeek = Math.ceil(
      (today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    currentWeek =
      currentWeek < 1 ? 1 : currentWeek > totalWeeks ? totalWeeks : currentWeek;

    // Get all months in the semester range
    let months = new Set<string>();
    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      months.add(tempDate.toLocaleString("en-US", { month: "long" }));
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      currentWeek,
      totalWeeks,
      months: Array.from(months),
      id: id,
    };
  };
  const [totalSessions, setTotalSessions] = useState(0);
  const [semesters, setSemesters] = useState<any>({});
  //   Create dynamic semester data
  useEffect(() => {
    if (sem.length > 0) {
      const semestes = sem.reduce((acc: any, s: any) => {
        acc[s.Semester_name] = calculateSemesterInfo(
          s.start_date.split("T")[0],
          s.end_date.split("T")[0],
          s.Semester_id
        );
        return acc;
      }, {});
      setSemesters(semestes);
    }
  }, [sem]);

  const generateWeeklyData = (
    semesterStartDate: string,
    semesterEndDate: string
    // Array of present dates
  ) => {
    const startDate = new Date(semesterStartDate);
    const endDate = new Date(semesterEndDate);
    const weeklyAttendance: { week: string; attendance: number }[] = [];

    let currentWeekStart = new Date(startDate); // First week's start
    let weekIndex = 1;

    while (currentWeekStart <= endDate) {
      let currentWeekEnd = new Date(currentWeekStart);

      if (weekIndex === 1) {
        // If first week starts on a weekday, end it on Saturday
        const startDay = currentWeekStart.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilSaturday = 6 - startDay; // How many days until Saturday
        currentWeekEnd.setDate(currentWeekStart.getDate() + daysUntilSaturday);
      } else {
        // Normal week (Monday–Sunday)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      }

      // Ensure week doesn't extend beyond semester end
      if (currentWeekEnd > endDate) {
        currentWeekEnd = new Date(endDate);
      }

      // Count present days within this week
      const presentCount = attendance.filter((dateStr: string) => {
        const recordDate = new Date(dateStr);
        return recordDate >= currentWeekStart && recordDate <= currentWeekEnd;
      }).length;

      // Expected sessions (5 per full week, adjust for first short week)
      let expectedSessions = 5;
      if (weekIndex === 1) {
        expectedSessions = Math.min(
          5,
          currentWeekEnd.getDate() - currentWeekStart.getDate() + 1
        ); // Adjust for short first week
      }

      const percentage = (presentCount / expectedSessions) * 100;
      weeklyAttendance.push({
        week: `Week ${weekIndex}`,
        attendance: Math.min(Math.round(percentage), 100), // Ensure max 100%
      });

      // Move to the next week: If first week is short, start next week on Monday
      if (weekIndex === 1) {
        currentWeekStart.setDate(currentWeekEnd.getDate() + 2); // Start on Monday
      } else {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      weekIndex++;
    }

    return weeklyAttendance;
  };

  // Generate monthly data for a subject
  const generateMonthlyData = (
    semesterStartDate: string,
    semesterEndDate: string
  ) => {
    const startDate = new Date(semesterStartDate);

    const endDate = new Date(semesterEndDate);

    const monthlyAttendance: { month: string; attendance: number }[] = [];

    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const month = tempDate.toLocaleString("en-US", { month: "long" });

      // Count how many present dates fall in this month
      const presentCount = attendance.filter((dateStr: any) => {
        const recordDate = new Date(dateStr);
        return (
          recordDate.getFullYear() === tempDate.getFullYear() &&
          recordDate.getMonth() === tempDate.getMonth()
        );
      }).length;

      // Expected sessions per month (adjust based on your schedule)
      const expectedSessions = 20;

      const percentage = (presentCount / expectedSessions) * 100;
      monthlyAttendance.push({
        month,
        attendance: Math.min(Math.round(percentage), 100),
      });

      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return monthlyAttendance;
  };

  useEffect(() => {
    if (subject) {
      async function subjectmap() {
        subject.map((subject: any) => {
          const s = {
            id: subject.subject_id,
            name: subject.subject_name,
            attended: subject.present_sessions,
            total: subject.total_sessions,
            schedule: "NA",
            instructor: "NA",
            weeklyData: generateWeeklyData(
              semesters[selectedSemester]?.startDate,
              semesters[selectedSemester]?.endDate
            ),
            monthlyData: generateMonthlyData(
              semesters[selectedSemester]?.startDate,
              semesters[selectedSemester]?.endDate
            ),
          };
          setWeeklyData(s.weeklyData);
          setMonthlyData(s.monthlyData);

          setSubjects((prev: any) => [...prev, s]);

          router.refresh();
        });
      }
      subjectmap();
    }
  }, [subject]);

  const [sub, setsub] = useState<string>("");

  const [timeframe, setTimeframe] = useState("week");
  const [selectedSubject, setSelectedSubject] = useState<string>("1");

  const [totalAttendance, setTotalAttendance] = useState(0);

  const [totalpercentage, setTotalPercentage] = useState(0);
  const [today, setToday]: any[] = useState([]);
  const [sa, setsa] = useState<any>([]);

  useEffect(() => {
    if (!selectedSemester) return;
    async function fetchreport() {
      const response = await axios.get(
        `/api/fetch-report?studentid=${student_id}&semester=${semester_id}`
      );

      const re = response.data.data[0].subjects;
      setsa(re);
      dispatch(userActions.fetchreport(response.data.data[0].subjects));

      re.map((r: any) => {
        r.attendance.map((a: any) => {
          if (a.status === "Present") {
            setAttendance((prev: any) => [...prev, a.date]);
          }
          setTotala((prev: any) => [...prev, a.date]);
          if (a.date === new Date().toISOString().split("T")[0]) {
            a.subject = r.subject_name;
            setToday((prev: any[]) => [...prev, a]);
          }
        });
      });

      setSubject(response.data.data[0].subjects);
      setTotalAttendance(response.data.data[0].present_sessions);
      setTotalSessions(response.data.data[0].total_sessions);
      setTotalPercentage(response.data.data[0].percentage);
    }
    fetchreport();
  }, [selectedSemester]);

  useEffect(() => {
    const handleBack = () => {
      router.replace("/division-dashboard"); // Redirect to the desired page
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [router]);

  useEffect(() => {
    if (sub.length > 0) {
      router.replace(`/division-dashboard/${param.id}/${sub}`);
    }
  }),
    [sub];

  useEffect(() => {
    async function fetchsemster() {
      const response = await axios.get(
        "/api/fetch-div-sem?semester_id=" + semester_id
      );

      setSem(response.data.data);

      setSelectedSemester(response.data.data[0].Semester_name as string);
    }
    fetchsemster();
  }, []);

  const [semesterInfo, setSemesterInfo] = useState<ReturnType<
    typeof calculateSemesterInfo
  > | null>(null);
  const [semesterProgress, setSemesterProgress] = useState(0);

  useEffect(() => {
    const info = semesters[selectedSemester as keyof typeof semesters];
    setSemesterInfo(info);
    setSemesterProgress(info ? (info.currentWeek / info.totalWeeks) * 100 : 0);
  }, [semesters]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-600";
    if (percentage >= 75) return "bg-yellow-600";
    return "bg-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderChart = () => {
    const data = timeframe === "week" ? weeklyData : monthlyData;

    return (
      <ChartContainer
        config={{
          attendance: {
            label: `Attendance`,
            color: "hsl(var(--primary))",
          },
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          {timeframe === "week" ? (
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))" }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                label={{
                  value: "Attendance %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "hsl(var(--muted-foreground))" },
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="attendance"
                fill="var(--color-attendance)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))" }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                label={{
                  value: "Attendance %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "hsl(var(--muted-foreground))" },
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="attendance"
                stroke="var(--color-attendance)"
                fill="var(--color-attendance)"
                fillOpacity={0.2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Track your attendance and academic progress
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedSemester} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(semesters).map((semester) => (
              <DropdownMenuItem
                key={semester}
                onClick={() => setSelectedSemester(semester)}
              >
                {semester}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attended
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance}</div>
            <p className="text-xs text-muted-foreground">For current </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Sessions this</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentage</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalpercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Minimum required 75%
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Semester Information</CardTitle>
          {subjects.length > 0 && (
            <Select onValueChange={(value) => setsub(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Subject Wise Attendance" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>
                  Start Date:{" "}
                  {semesterInfo?.startDate
                    ? formatDate(semesterInfo.startDate)
                    : "N/A"}
                </span>
                <span>
                  End Date:{" "}
                  {semesterInfo?.endDate
                    ? formatDate(semesterInfo.endDate)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Current Week: {semesterInfo?.currentWeek ?? "N/A"} of{" "}
                  {semesterInfo?.totalWeeks ?? "N/A"}
                </span>
                <span className="text-muted-foreground">Semester Progress</span>
              </div>
              <Progress value={semesterProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {subjects.map(
          (subject: {
            id: number;
            name: string;
            attended: number;
            total: number;
            schedule: string;
            instructor: string;
          }) => {
            const attendancePercentage = Math.round(
              (subject.attended / subject.total) * 100
            );
            return (
              <Card key={subject.id} onClick={() => console.log("clicked")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {subject.name}
                  </CardTitle>
                  <span
                    className={`text-sm font-bold ${getAttendanceColor(
                      attendancePercentage
                    )}`}
                  >
                    {attendancePercentage ? attendancePercentage : 0}%
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress
                      value={attendancePercentage}
                      className={`h-2 ${getProgressColor(
                        attendancePercentage
                      )}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {subject.attended} of {subject.total} classes attended
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Schedule: {subject.schedule}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Instructor: {subject.instructor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Attendance Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={timeframe}
            onValueChange={setTimeframe}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <div className="rounded-lg border p-4">{renderChart()}</div>
          </Tabs>
        </CardContent>
      </Card>
      {today?.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {today.map((class_: any) => (
                  <TableRow key={class_.id}>
                    <TableCell className="font-medium">
                      {class_.subject}
                    </TableCell>
                    <TableCell>{class_.time}</TableCell>
                    <TableCell>
                      {class_.status === "Present" ? (
                        <span className="text-green-600">Present</span>
                      ) : (
                        <span className="text-red-600">Absent</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
