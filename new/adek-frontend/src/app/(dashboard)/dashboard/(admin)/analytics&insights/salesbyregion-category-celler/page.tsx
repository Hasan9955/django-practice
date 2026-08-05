"use client";

import { TimerengerIcon } from "@/assets/svgIcon";
import PieChartPage from "@/components/pages/dashboard/adminDashboard/analytics&insights/PieChartPage";
import React, { useEffect, useState } from "react";

// ── Live Clock Hook ────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set immediately on mount (client-side only)
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

// ── Format helpers ─────────────────────────────────────────────
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Page ───────────────────────────────────────────────────────
const Page = () => {
  const now = useLiveClock();

  return (
    <div className="bg-white rounded-[16px] p-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-black font-sans text-[28px] md:text-[32px] font-bold mb-2 leading-tight">
            Visualize Performance Across Geographies & Segments
          </h2>
          <p className="text-[#5F6368] font-sans text-[16px] md:text-[18px] font-medium">
            Quickly understand how your platform is performing in every region
            and market segment.
          </p>
        </div>

        {/* Current Time Widget */}
        <div className="rounded-[12px] bg-[#F0F0F0] flex-shrink-0 px-4 py-3 min-w-[180px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-[#667085] font-sans text-sm font-normal whitespace-nowrap">
                Current time
              </h4>
              {now ? (
                <p className="text-black font-sans text-sm font-semibold whitespace-nowrap mt-0.5">
                  {formatDate(now)},{" "}
                  <span className="text-[#10B981]">{formatTime(now)}</span>
                </p>
              ) : (
                /* SSR / hydration placeholder */
                <div className="h-4 w-36 rounded bg-gray-200 animate-pulse mt-1" />
              )}
            </div>
            <TimerengerIcon />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#CECECE] mt-8 mb-7" />

      {/* Chart Section */}
      <PieChartPage />
    </div>
  );
};

export default Page;