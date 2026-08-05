/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useMemo } from "react";
import { Calendar, MapPin, Search, TrendingUp, Minus } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/Button/Button";
import Input from "antd/es/input/Input";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { useGetAdminDashboardQuery } from "@/redux/features/dashborad/platform/platformManagementApi";

// ── Color palette ──────────────────────────────────────────────
const REGION_COLORS: Record<string, string> = {
  Asia: "#10B981",
  Europe: "#059669",
  "North America": "#84CC16",
  "South America": "#EF4444",
  Africa: "#1F2937",
  Oceania: "#F59E0B",
  "Middle East": "#92400E",
  Other: "#06B6D4",
};

// ── Types ──────────────────────────────────────────────────────
interface RegionData {
  name: string;
  value: number;
}

interface SalesDataItem {
  id: number;
  name: string;
  value: number;
  color: string;
}

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SalesDataItem }>;
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          <span className="font-semibold text-gray-800">{d.name}</span>
        </div>
        <span className="text-gray-500 pl-4">
          Share:{" "}
          <span className="font-bold text-gray-900">{d.value.toFixed(2)}%</span>
        </span>
      </div>
    );
  }
  return null;
};

// ── Loading Skeleton ───────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {/* Header row */}
    <div className="flex items-center gap-4 mb-8">
      <div className="h-9 w-28 rounded-lg bg-gray-100" />
      <div className="h-9 flex-1 max-w-xs rounded-lg bg-gray-100" />
      <div className="h-9 flex-1 max-w-xs rounded-lg bg-gray-100" />
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Chart skeleton */}
        <div className="flex justify-center">
          <div className="w-72 h-72 rounded-full bg-gray-100 relative">
            <div className="absolute inset-8 rounded-full bg-white" />
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between mb-6">
            <div className="h-4 w-20 rounded bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-100" />
              </div>
              <div className="h-4 w-10 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="h-7 w-20 rounded bg-gray-100 mb-2" />
          <div className="h-4 w-28 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  </div>
);

// ── Error State ────────────────────────────────────────────────
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-80 gap-4">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
      <span className="text-2xl">⚠️</span>
    </div>
    <div className="text-center">
      <p className="font-semibold text-gray-800 mb-1">Failed to load chart data</p>
      <p className="text-sm text-gray-500">Something went wrong while fetching region data.</p>
    </div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
export default function PieChartPage() {
  const { data, isLoading, isError, refetch } =
    useGetAdminDashboardQuery({});

  const [location, setLocation] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ── Transform API data ───────────────────────────────────────
  const salesData = useMemo<SalesDataItem[]>(() => {
    if (!data?.result) return [];
    return (data.result as RegionData[]).map((item, index) => ({
      id: index + 1,
      name: item.name,
      value: parseFloat(item.value.toFixed(2)),
      color: REGION_COLORS[item.name] ?? "#9333EA",
    }));
  }, [data]);

  // ── Filtered list (search) ───────────────────────────────────
  const filteredData = useMemo<SalesDataItem[]>(() => {
    if (!searchTerm) return salesData;
    const q = searchTerm.toLowerCase();
    return salesData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.value.toString().includes(q)
    );
  }, [searchTerm, salesData]);

  // Chart uses only non-zero slices
  const chartData = filteredData.filter((item) => item.value > 0);

  const activeRegions = filteredData.filter((i) => i.value > 0).length;


  // ── Render ───────────────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 h-9 px-3 text-sm rounded-lg"
        >
          <Calendar className="w-4 h-4 text-gray-400" />
          Today
        </Button>

        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Enter your location"
            value={location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocation(e.target.value)
            }
            className="pl-9 h-9 bg-white border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search regions or values…"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-9 h-9 bg-white border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── Chart Card ──────────────────────────────────────── */}
      <Card className="bg-white shadow-sm border border-gray-100 rounded-2xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Chart */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-semibold text-gray-600 mb-1 self-start">
                Sales Distribution
              </h4>
              <p className="text-xs text-gray-400 mb-6 self-start">
                By geographic region
              </p>

              {chartData.length === 0 ? (
                <div className="w-72 h-72 flex flex-col items-center justify-center text-center gap-3 rounded-full border-2 border-dashed border-gray-200">
                  <Search className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-400 px-8">
                    No active regions match your search
                  </p>
                </div>
              ) : (
                <div className="w-72 h-72 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip
                            active={props.active}
                            payload={
                              props.payload as Array<{ payload: SalesDataItem }> | undefined
                            }
                          />
                        )}
                        cursor={false}
                      />
                      {/* Center label via foreignObject workaround */}
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fill: "#111827",
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {activeRegions}
                      </text>
                      <text
                        x="50%"
                        y="56%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fill: "#9CA3AF", fontSize: 12 }}
                      >
                        Regions
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Mini legend pills */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-xs">
                {chartData.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Legend Table */}
            <div>
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Area
                </h3>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Sales Insight
                </h3>
              </div>

              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-4 ring-opacity-20 transition-all"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {item.value > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <span
                        className={`text-sm font-semibold min-w-[3rem] text-right ${
                          item.value === 0
                            ? "text-gray-300"
                            : "text-gray-900"
                        }`}
                      >
                        {item.value === 0 ? "—" : `${item.value}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No results found for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    
    </div>
  );
}