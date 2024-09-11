"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import { TimesheetData } from "./data";
import DarkTheme from "./theme";

// Sample data (expanded for more variety)

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};
export function Dashboard() {
  const [data] = useState(TimesheetData);

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: lastMonth,
    to: today,
  });

  const [selectedPerson, setSelectedPerson] = useState<string>("all");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = parseISO(item.weekStartDate);
      const isInDateRange =
        dateRange.from === undefined
          ? true
          : dateRange.from <= itemDate &&
            (dateRange.to === undefined || itemDate <= dateRange.to);
      const isSelectedPerson =
        selectedPerson === "all" || item.name === selectedPerson;
      return isInDateRange && isSelectedPerson;
    });
  }, [dateRange, selectedPerson, data]);

  const totalHoursLogged = filteredData.reduce(
    (sum, item) => sum + item.hoursLogged,
    0
  );
  const totalTimeOff = filteredData.reduce(
    (sum, item) => sum + item.timeOff,
    0
  );
  const averageHoursPerWeek = totalHoursLogged / (filteredData.length / 2);

  const uniqueNames = Array.from(
    new Set(
      data
        .filter((item) => {
          const itemDate = parseISO(item.weekStartDate);
          const isInDateRange =
            dateRange.from === undefined
              ? true
              : dateRange.from <= itemDate &&
                (dateRange.to === undefined || itemDate <= dateRange.to);
          const isSelectedPerson =
            selectedPerson === "all" || item.name === selectedPerson;
          return isInDateRange && isSelectedPerson;
        })
        .map((item) => item.name)
    )
  );

  const pieChartData = useMemo(() => {
    const projectHours = filteredData.reduce((acc, item) => {
      acc[item.project] = (acc[item.project] || 0) + item.hoursLogged;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(projectHours).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const weeklyData = filteredData.reduce((acc, item) => {
      const week = format(parseISO(item.weekStartDate), "w");
      acc[week] = (acc[week] || 0) + item.hoursLogged;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(weeklyData).map(([week, hours]) => ({ week, hours }));
  }, [filteredData]);

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedPerson("all");
  };

  const isFiltered = dateRange !== undefined || selectedPerson !== "all";

  const handleSelectRange = (range: DateRange | undefined) => {
    setDateRange({
      from: range?.from,
      to: range?.to ?? range?.from,
    });
  };

  return (
    <div className="p-8 min-h-screen w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Employee Time Dashboard</h1>
        <DarkTheme />
      </div>
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleSelectRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select value={selectedPerson} onValueChange={setSelectedPerson}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-gray-700">
              All Employees
            </SelectItem>
            {uniqueNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-400 dark:to-black-700 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-blue-300 dark:border-blue-700 border-opacity-50">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-100">
              Total Hours Logged
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
              {totalHoursLogged} hours
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-500 dark:to-gray-700 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-green-300 dark:border-green-700 border-opacity-50">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
              Total Time Off
            </CardTitle>
            <PalmtreeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-900 dark:text-green-200">
              {totalTimeOff} hours
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500 dark:to-black-700 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-purple-300 dark:border-purple-600 border-opacity-50">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-100">
              Avg Hours/Week
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">
              {isFinite(averageHoursPerWeek)
                ? averageHoursPerWeek.toFixed(1)
                : "0"}{" "}
              hours
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500 dark:to-grey-100 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-orange-300 dark:border-orange-600 border-opacity-50">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-100">
              Employees
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-300" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-200">
              {uniqueNames.length}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Hours Logged Over Time Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-grey-600">
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Hours Logged Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <XAxis dataKey="weekStartDate" stroke={"#4b5563"} />
                <YAxis stroke={"#4b5563"} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hoursLogged"
                  stroke={"#3b82f6"}
                  name="Hours Logged"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hours Logged vs Time Off Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-grey-900">
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Hours Logged vs Time Off
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData}>
                <XAxis dataKey="weekStartDate" stroke={"#4b5563"} />
                <YAxis stroke={"#4b5563"} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="hoursLogged"
                  stackId="a"
                  fill={"#3b82f6"}
                  name="Hours Logged"
                />
                <Bar
                  dataKey="timeOff"
                  stackId="a"
                  fill={"#22c55e"}
                  name="Time Off"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Project Time Distribution Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-700 dark:to-purple-800">
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Project Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={"#8884d8"}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity Heatmap Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-700 dark:to-yellow-800">
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Weekly Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={heatmapData} layout="vertical">
                <XAxis type="number" stroke={"#4b5563"} />
                <YAxis dataKey="week" type="category" stroke={"#4b5563"} />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6">
                  {heatmapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`rgba(59, 130, 246, ${entry.hours / 50})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hours Logged vs Time Off Correlation Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-700 dark:to-pink-800">
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Hours Logged vs Time Off Correlation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <XAxis
                  dataKey="hoursLogged"
                  name="Hours Logged"
                  stroke={"#4b5563"}
                />
                <YAxis dataKey="timeOff" name="Time Off" stroke={"#4b5563"} />
                <ZAxis dataKey="name" name="Employee" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={filteredData} fill={"#3b82f6"} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PalmtreeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4" />
      <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3" />
      <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z" />
      <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14" />
    </svg>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
