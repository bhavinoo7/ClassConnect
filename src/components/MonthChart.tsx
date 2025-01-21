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
  { month: "January", lecture: 1 },
  { month: "February", lecture: 1},
  { month: "March", lecture: 1 },
  { month: "April", lecture: 1 },
  { month: "May", lecture: 1 },
  { month: "June", lecture: 1 },
  { month: "June", lecture: 1 },
  { month: "July", lecture: 1 },
  { month: "August", lecture: 1 },
  { month: "September", lecture: 1 },
  { month: "October", lecture: 1 },
  { month: "November", lecture: 1 },
  { month: "December", lecture: 1 },
]

const chartConfig = {
  lecture: {
    label: "Lecture",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function MonthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Month Attendance</CardTitle>
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
          Month Attendance Graph <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total attendance for the Month
        </div>
      </CardFooter>
    </Card>
  )
}
