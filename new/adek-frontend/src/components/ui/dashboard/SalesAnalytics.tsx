/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart/Chart";
import { Button } from "@/components/ui/Button/Button";
import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu/DropDownMenu";
import { useGetSellerSalesAnalyticsQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";

const chartConfig = {
  value: {
    label: "Sales Performance",
    color: "#B0D6FF",
  },
};

export default function SalesAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { data } = useGetSellerSalesAnalyticsQuery({ filter: selectedPeriod });
  const salesData = data?.result?.data;

  const periods = ["year", "month", "week"];

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sales Analytics
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {selectedPeriod}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {periods.map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? "bg-gray-100" : ""}
                >
                  {period}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full ">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={salesData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B0D6FF" stopOpacity={1} />
                <stop offset="100%" stopColor="#B0D6FF" stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => `${value}%`}
              ticks={[0, 10, 30, 50, 70, 90, 100]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${value}%`, "Sales Performance"]}
                  labelFormatter={(label) => {
                    const item = salesData.find((d: any) => d.day === label);
                    return item?.fullDay || label;
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#B0D6FF"
              strokeWidth={1}
              fill="url(#salesGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Additional Stats */}
      <div className="mt-6  grid-cols-3 gap-4 hidden">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">81%</div>
          <div className="text-sm text-gray-600">Average Performance</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">+12%</div>
          <div className="text-sm text-gray-600">vs Last Week</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">92%</div>
          <div className="text-sm text-gray-600">Peak Day (Thursday)</div>
        </div>
      </div>
    </div>
  );
}
