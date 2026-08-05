
"use client";

import { useEffect } from "react";
import { Spin } from "antd";
import { Calendar, ChevronDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/Button/Button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart/Chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu/DropDownMenu";

interface ChartPoint {
  month: string;
  revenue: number;
}

interface SalesAnalyticsProps {
  chartData: ChartPoint[];
  year?: number;
  filter: string;          // selected year (e.g. "2026")
  onFilterChange: (val: string) => void;
  isLoading?: boolean;
}

const chartConfig = {
  revenue: { label: "Revenue", color: "#6366f1" },
};

// Prev 3 years + Current + Next 2 years
const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => String(currentYear - 3 + i));
};

export default function AdminSellerAnalytics({
  chartData,
  year,
  filter,
  onFilterChange,
  isLoading = false,
}: SalesAnalyticsProps) {
  const YEARS = getAvailableYears();
  const currentYearStr = String(new Date().getFullYear());

  // ─────────────────────────────────────────────
  // FIX: Force default to current year on mount
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!filter || !YEARS.includes(filter)) {
      onFilterChange(currentYearStr);
    }
  }, [filter, onFilterChange, YEARS, currentYearStr]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const peakEntry = chartData.reduce(
    (best, d) => (d.revenue > best.revenue ? d : best),
    { month: "—", revenue: 0 }
  );
  const avgRevenue =
    chartData.length > 0 ? Math.round(totalRevenue / chartData.length) : 0;

  return (
    <div className="w-full">
      {/* Header + Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            Sales Analytics{year ? ` · ${year}` : ""}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Yearly revenue performance</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 hidden sm:inline">Year</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10 px-5 text-base font-medium rounded-2xl border-gray-300 hover:border-gray-400"
              >
                <Calendar className="h-4 w-4 text-gray-400" />
                {filter || currentYearStr}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px] rounded-2xl">
              {YEARS.map((yr) => (
                <DropdownMenuItem
                  key={yr}
                  onClick={() => onFilterChange(yr)}
                  className={`text-base cursor-pointer py-3 px-4 ${
                    filter === yr
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {yr}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex-1 min-w-[220px] flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-3xl px-6 py-5">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          <div className="flex-1">
            <p className="text-xs text-indigo-400 uppercase tracking-[0.5px] font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-indigo-700">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {peakEntry.revenue > 0 && (
          <div className="flex-1 min-w-[220px] flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-3xl px-6 py-5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-emerald-500 uppercase tracking-[0.5px] font-semibold">Peak Month</p>
              <p className="text-2xl font-bold text-emerald-700">
                {peakEntry.month} · ${peakEntry.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-[220px] flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5">
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-[0.5px] font-semibold">Monthly Avg</p>
            <p className="text-2xl font-bold text-gray-700">${avgRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Spin spinning={isLoading} tip="Loading chart…">
        <div className="h-80 sm:h-96 w-full bg-white rounded-3xl border border-gray-100 p-2 shadow-sm">
          {!isLoading && chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <TrendingUp className="h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">No revenue data for this year</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData} margin={{ top: 20, right: 12, left: 12, bottom: 12 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b" }}
                  dy={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b" }}
                  width={60}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </Spin>
    </div>
  );
}
