"use client";

import { useState } from "react";
import {
  CancelledIcon,
  DeliveredIcon,
  OderIocon,
  ProcessingIcon,
  ReturnedIcon,
} from "@/assets/svgIcon";
import OrderStatusCard from "@/components/ui/Card/OrderStatusCard";
import { Col, Row, Skeleton, Spin, Statistic } from "antd";
import { ArrowDownToLine, Package, ShoppingCart, Wallet } from "lucide-react";
import OrderDashboard from "./OrderDashboard";
import {
  useGetSellerOdersTableQuery,
  useGetSellerPerformanceQuery,
  useGetSellerSellsChartQuery,
} from "@/redux/features/dashborad/sellerProfile/sellerProfileApi";
import AdminSellerAnalytics from "./AdminSellerAnalytics";
import { useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Top metric card
// ─────────────────────────────────────────────
function MetricTile({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`${iconBg} ${iconColor} p-2 rounded-lg`}>{icon}</div>
      </div>
      <Statistic
        value={value}
        valueStyle={{
          fontSize: 26,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.1,
        }}
      />
      {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function PerformanceMonitor() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("id") as string;
  const [chartFilter, setChartFilter] = useState("year");
  const [page, setPage] = useState(1);
  const limit = 25;

  // ── API calls ─────────────────────────────
  const { data: perfData, isLoading: perfLoading } =
    useGetSellerPerformanceQuery(sellerId);

  const { data: chartData, isLoading: chartLoading } =
    useGetSellerSellsChartQuery({ sellerId, filter: chartFilter });

  const { data: ordersData, isLoading: ordersLoading } =
    useGetSellerOdersTableQuery({ sellerId, limit, page });

  // ── Derived data ──────────────────────────
  const perf = perfData?.result;
  const chart = chartData?.result;
  const orders = ordersData?.result;

  const statuses = [
    { label: "New order", count: perf?.newOrder ?? 0, icon: <OderIocon /> },
    {
      label: "Cancelled",
      count: perf?.cancelledOrder ?? 0,
      icon: <CancelledIcon />,
    },
    { label: "Returned", count: 0, icon: <ReturnedIcon /> },
    {
      label: "Processing",
      count: perf?.processedOrder ?? 0,
      icon: <ProcessingIcon />,
    },
    {
      label: "Delivered",
      count: perf?.deliveredOrder ?? 0,
      icon: <DeliveredIcon />,
    },
  ];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── TOP METRIC CARDS ─────────────────── */}
      <Skeleton
        loading={perfLoading}
        active
        paragraph={{ rows: 3 }}
        className="rounded-xl"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <MetricTile
              title="Total Products"
              value={perf?.totalProducts ?? 0}
              subtitle="Active listings"
              icon={<Package className="h-4 w-4" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricTile
              title="Total Orders"
              value={perf?.totalOrder ?? 0}
              subtitle="All time orders"
              icon={<ShoppingCart className="h-4 w-4" />}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricTile
              title="New Orders"
              value={perf?.newOrder ?? 0}
              subtitle="Pending fulfillment"
              icon={<Wallet className="h-4 w-4" />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <MetricTile
              title="Delivered"
              value={perf?.deliveredOrder ?? 0}
              subtitle="Completed deliveries"
              icon={<ArrowDownToLine className="h-4 w-4" />}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
            />
          </Col>
        </Row>
      </Skeleton>

      {/* ── SELL INSIGHT PANEL ───────────────── */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col gap-8 p-6 w-full">
        <h3 className="text-[#322F35] font-semibold text-xl md:text-2xl">
          Sell Insight
        </h3>

        {/* Order status row */}
        <Skeleton loading={perfLoading} active paragraph={{ rows: 2 }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {statuses.map((status, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center text-center p-4 ${
                  index !== statuses.length - 1
                    ? "border-b-2 sm:border-b-0 lg:border-r-2 border-gray-100"
                    : ""
                }`}
              >
                <OrderStatusCard
                  label={status.label}
                  count={status.count}
                  icon={status.icon}
                />
              </div>
            ))}
          </div>
        </Skeleton>

        <div className="w-full h-px bg-gray-100" />

        {/* Sales chart — receives real API data + filter state */}
        <Spin spinning={chartLoading} tip="Loading chart…">
          <AdminSellerAnalytics
            chartData={chart?.data ?? []}
            year={chart?.year}
            filter={chartFilter}
            onFilterChange={setChartFilter}
            isLoading={chartLoading}
          />
        </Spin>
      </div>

      {/* ── ORDER TABLE PANEL ────────────────── */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6">
        <OrderDashboard
          data={orders?.data ?? []}
          meta={orders?.meta}
          page={page}
          onPageChange={(p) => setPage(p)}
          isLoading={ordersLoading}
          totalOrder={orders?.totalOrder ?? perf?.totalOrder ?? 0}
          totalStore={orders?.totalStore ?? 0}
        />
      </div>
    </div>
  );
}
