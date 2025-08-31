"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { month: "Monday", lecture: 1 },
  { month: "Tuesday", lecture: 0},
  { month: "Wednesday", lecture: 1 },
  { month: "Thursday", lecture: 1 },
  { month: "Firday", lecture: 1 },
  { month: "Saturday", lecture: 1 },
]

const chartConfig = {
  lecture: {
    label: "Lecture",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function WeekChart({divisions}:any) {
  const date = new Date("2025-01-19T17:25:48.285+00:00");
const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="lecture" fill="var(--color-desktop)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Week Attendance Graph <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total attendance for the week
        </div>
      </CardFooter>
    </Card>
  )
}
