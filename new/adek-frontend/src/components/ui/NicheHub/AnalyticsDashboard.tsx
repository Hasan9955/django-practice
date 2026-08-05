"use client";

import {
  useGetSellerDashboardStatsQuery,
  useGetSellerSalesAnalyticsQuery,
} from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { useState, useMemo } from "react";
import { Skeleton } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── API value sanitiser ──────────────────────────────────────────────────────

/**
 * Safely coerces any value the API might return into a finite number.
 * Handles strings ("880.00"), numbers (880), null, undefined, and NaN.
 *
 * Examples:
 *   toNumber("880.00")  → 880
 *   toNumber(1)         → 1
 *   toNumber(null)      → 0
 *   toNumber("abc")     → 0
 *   toNumber(Infinity)  → 0
 */
const toNumber = (val: string | number | null | undefined): number => {
  const n = typeof val === "string" ? parseFloat(val) : Number(val ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// ─── Number formatting ────────────────────────────────────────────────────────

const TIERS = [
  { threshold: 1_000_000_000, suffix: "B", divisor: 1_000_000_000 },
  { threshold: 1_000_000,     suffix: "M", divisor: 1_000_000     },
  { threshold: 1_000,         suffix: "K", divisor: 1_000         },
] as const;

/**
 * Converts any finite number into a compact, human-readable string.
 * Handles negatives, NaN, Infinity, and up to the billions tier.
 *
 * Examples:
 *   0         → "0"
 *   999        → "999"
 *   1_500      → "1.5K"
 *   15_400     → "15.4K"
 *   1_234_567  → "1.2M"
 *   -42_000    → "-42K"
 */
const formatCompactNumber = (num: number): string => {
  if (!Number.isFinite(num) || num === 0) return "0";

  const sign = num < 0 ? "-" : "";
  const abs  = Math.abs(num);

  for (const { threshold, suffix, divisor } of TIERS) {
    if (abs >= threshold) {
      const compact = (abs / divisor).toFixed(1).replace(/\.0$/, "");
      return `${sign}${compact}${suffix}`;
    }
  }

  // Below 1,000 — use locale commas (e.g. "999")
  return sign + abs.toLocaleString();
};

// ─── Currency formatting ──────────────────────────────────────────────────────

/**
 * Formats a dollar amount compactly with a leading "$".
 * Pass `decimals: 2` to force cents (useful in tooltips).
 *
 * Examples:
 *   formatRevenue(0)        → "$0"
 *   formatRevenue(1_250)    → "$1.3K"
 *   formatRevenue(99.9, 2)  → "$99.90"
 */
const formatRevenue = (amount: number, decimals?: number): string => {
  if (!Number.isFinite(amount)) return "$0";

  // Full precision path (e.g. tooltip showing exact cents)
  if (decimals !== undefined) {
    return `$${amount.toFixed(decimals)}`;
  }

  return `$${formatCompactNumber(amount)}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [filter, setFilter] = useState<"week" | "month" | "year">("year");

  const { data: statsData, isLoading: isStatsLoading } =
    useGetSellerDashboardStatsQuery({});
  const { data: analyticsData, isLoading: isAnalyticsLoading } =
    useGetSellerSalesAnalyticsQuery({ filter });

  const rechartsData = useMemo(() => {
    if (!analyticsData?.success || !analyticsData?.result?.data) return [];
    return analyticsData.result.data.map(
      (d: { day: string; value: number }) => ({
        name: d.day,
        uv: d.value,
      }),
    );
  }, [analyticsData]);

  const maxValue = useMemo(() => {
    if (rechartsData.length === 0) return 0;
    return Math.max(...rechartsData.map((item: { uv: number }) => item.uv));
  }, [rechartsData]);

  return (
    /*
     * Outer wrapper padding
     *
     * When standalone / full-width (Mobile, SM):
     *   Mobile (<640px) : p-3
     *   SM     (640-767): p-4
     *
     * When inside md:col-span-2 sidebar (~287–397px wide):
     *   MD  (768-1023)  : p-3  ← REDUCED, sidebar is only ~287px
     *   LG  (1024-1279) : p-4  ← sidebar is ~317px
     *   XL  (1280+)     : p-5  ← sidebar is ~397px, more room
     */
    <div className="space-y-3 sm:space-y-4 xl:space-y-5 bg-white p-3 sm:p-4 md:p-3 lg:p-4 xl:p-5 rounded-2xl">

      {/* ── Metric Cards ─────────────────────────────────────────────────────
       *
       * Grid strategy:
       *   Mobile (<640px)   : 1 col — full width, stacked
       *   SM     (640-767)  : 2 cols — full width, enough room
       *   MD     (768-1023) : 1 col — enters narrow sidebar (~287px)
       *   LG     (1024-1279): 1 col — sidebar ~317px, still tight for 2
       *   XL     (1280+)    : 2 cols — sidebar ~397px, comfortable
       ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">

        {/* Total Products */}
        <div className="bg-white border border-[#E4E4E4] rounded-2xl p-3 sm:p-5 md:p-3 lg:p-4 xl:p-5">

          <div className="text-xs sm:text-sm md:text-xs xl:text-sm font-medium text-[#5B5959] leading-snug">
            Total Products Uploaded
          </div>

          {isStatsLoading ? (
            <Skeleton
              active
              paragraph={false}
              title={{ width: 100 }}
              className="mt-2 sm:mt-3 md:mt-2 lg:mt-3"
            />
          ) : (
            /*
             * Metric number sizing — drops down when entering the narrow sidebar
             * at MD, then scales back up as the sidebar widens at LG and XL.
             *
             * Sidebar widths   → safe font sizes:
             *   Mobile (<640)  full-width   → 26px
             *   SM     (640)   full-width   → 34px
             *   MD     (768)   ~287px       → 26px
             *   LG     (1024)  ~317px       → 28px
             *   XL     (1280)  ~397px       → 34px
             *   2XL    (1536)  ~430px       → 38px
             */
            <div className="mt-2 sm:mt-3 md:mt-2 lg:mt-3 text-[26px] sm:text-[34px] md:text-[26px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] font-bold text-gray-900 leading-none">
              {formatCompactNumber(toNumber(statsData?.result?.totalProduct))}
            </div>
          )}
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-[#E4E4E4] rounded-2xl p-3 sm:p-5 md:p-3 lg:p-4 xl:p-5">
          <div className="text-xs sm:text-sm md:text-xs xl:text-sm font-medium text-blue-600 leading-snug">
            Total Revenue
          </div>

          {isStatsLoading ? (
            <Skeleton
              active
              paragraph={false}
              title={{ width: 110 }}
              className="mt-2 sm:mt-3 md:mt-2 lg:mt-3"
            />
          ) : (
            <div className="mt-2 sm:mt-3 md:mt-2 lg:mt-3 text-[26px] sm:text-[34px] md:text-[26px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] font-bold text-blue-600 leading-none">
              {formatRevenue(toNumber(statsData?.result?.totalRevenue))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sales Analytics Chart ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E4E4E4] p-3 sm:p-5 md:p-3 lg:p-4 xl:p-5">

        {/* Chart header
         *
         * Layout strategy:
         *   Mobile (<640)   : flex-col — stacked
         *   SM     (640-767): flex-row — full width, fits side by side
         *   MD     (768-1023): flex-col — narrow sidebar, stack again
         *   XL     (1280+)  : flex-row — sidebar ~397px, fits again
         */}
        <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row xl:items-center xl:justify-between gap-2 sm:gap-3 md:gap-2 xl:gap-3 mb-3 sm:mb-4 md:mb-3 xl:mb-4">

          <h3 className="text-sm sm:text-lg md:text-sm lg:text-base xl:text-lg font-semibold text-gray-900">
            Sales Analytics
          </h3>

          {/* Filter segmented buttons
           *
           * self-start prevents pill group from stretching full-width
           * when flex-col is active (mobile and MD sidebar).
           * min-h-[44px] preserves WCAG touch target at every size.
           */}
          <div className="flex flex-wrap bg-gray-100 rounded-2xl p-1 self-start xl:self-auto">
            {(["week", "month", "year"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`
                  min-h-[44px]
                  px-3 sm:px-4 md:px-2 lg:px-3 xl:px-4
                  text-xs
                  rounded-[14px] font-medium transition-all
                  ${
                    filter === option
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {option === "week" ? "Week" : option === "month" ? "Month" : "Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart container
         *
         * Heights tuned to maintain a reasonable aspect ratio
         * as the container width changes between full-width and sidebar:
         *
         *   Mobile (<640)  : 180px  full width
         *   SM     (640)   : 220px  full width
         *   MD     (768)   : 160px  sidebar ~287px
         *   LG     (1024)  : 180px  sidebar ~317px
         *   XL     (1280)  : 220px  sidebar ~397px
         *   2XL    (1536)  : 260px  sidebar ~430px
         */}
        <div className="w-full h-[180px] sm:h-[220px] md:h-[160px] lg:h-[180px] xl:h-[220px] 2xl:h-[260px]">
          {isAnalyticsLoading || rechartsData.length === 0 ? (
            <Skeleton active style={{ height: "100%" }} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rechartsData}
                /*
                 * Tighter right margin at MD/LG — sidebar is narrow
                 * and every pixel of chart width matters.
                 */
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/*
                 * X-axis: preserveStartEnd prevents label collisions at
                 * narrow widths (MD sidebar is only ~287px).
                 */}
                <XAxis
                  dataKey="name"
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />

                {/*
                 * Y-axis: width={40} is tighter than a default 48px —
                 * those 8px matter inside a ~287px sidebar.
                 * formatCompactNumber keeps labels short so they fit.
                 */}
                <YAxis
                  width={40}
                  domain={[0, maxValue * 1.05]}
                  tickFormatter={(value: number) => formatCompactNumber(value)}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />

                {/*
                 * Tooltip pinned to top (y: 0) so it never overflows
                 * the chart bounds on narrow widths.
                 * decimals=2 here gives exact cents e.g. "$1,250.00"
                 */}
                <Tooltip
                  position={{ y: 0 }}
                  formatter={(value: number) => [
                    formatRevenue(value, 2),
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#6B7280", fontSize: "11px" }}
                />

                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}