"use client";

import { useState } from "react";
import { ShoppingCart, Store, Users } from "lucide-react";
import { Empty, Pagination, Spin, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Text } = Typography;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface OrderUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  orderStatus: string;
  createdAt: string;
  deliveryAddress: string | null;
  user: OrderUser;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface OrderDashboardProps {
  // Real order data from API
  data: OrderRow[];
  meta?: Meta;
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  // Summary counts from performance API
  totalOrder?: number;
  totalStore?: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  Pending: "orange",
  Processing: "blue",
  Delivered: "green",
  Cancelled: "red",
  Returned: "volcano",
};

const TABS = [
  { id: "total-order" as const, label: "Total Order", icon: ShoppingCart },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function OrderDashboard({
  data,
  meta,
  page,
  onPageChange,
  isLoading = false,
  totalOrder = 0,
  totalStore = 0,
}: OrderDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "my-shop" | "total-order" | "reseller-point"
  >("total-order");

  // ── Table columns ───────────────────────────
  const columns: ColumnsType<OrderRow> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 180,
      render: (val: string) => (
        <Text className="font-mono text-sm font-semibold text-gray-800">
          {val}
        </Text>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: unknown, record: OrderRow) => (
        <div className="flex flex-col gap-0.5">
          <Text className="font-semibold text-gray-800 text-sm">
            {record.user.fullName}
          </Text>
          <Text className="text-xs text-gray-400">{record.user.email}</Text>
          <Text className="text-xs text-gray-400">
            {record.user.phoneNumber}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 130,
      filters: Object.keys(STATUS_COLOR).map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.orderStatus === value,
      render: (status: string) => (
        <Tag
          color={STATUS_COLOR[status] ?? "default"}
          className="rounded-full px-3 py-0.5 text-xs font-medium capitalize border-0"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Delivery Address",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
      render: (addr: string | null) =>
        addr ? (
          <Tooltip title={addr}>
            <Text className="text-sm text-gray-600 block max-w-[180px] truncate">
              {addr}
            </Text>
          </Tooltip>
        ) : (
          <Text className="text-xs text-gray-300 italic">Not set</Text>
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: (a: OrderRow, b: OrderRow) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <div className="flex flex-col gap-0.5">
          <Text className="text-sm text-gray-700">
            {dayjs(date).format("DD MMM YYYY")}
          </Text>
          <Text className="text-xs text-gray-400">
            {dayjs(date).format("hh:mm A")}
          </Text>
        </div>
      ),
    },
  ];

  // ── Tab counts ──────────────────────────────
  const tabCounts: Record<string, number> = {
    "my-shop": totalStore,
    "total-order": totalOrder,
    "reseller-point": 0,
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* ── Header ─────────────────────────── */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 md:mb-8">
        Order Insight
      </h2>

      {/* ── Tab pills ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7 md:mb-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-200 w-full sm:w-auto ${
                active
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  active ? "text-indigo-500" : "text-gray-400"
                }`}
              />
              <div className="flex-1 text-left sm:text-left">
                <p
                  className={`text-xs font-medium ${
                    active ? "text-indigo-500" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </p>
                <p
                  className={`text-2xl font-bold leading-none ${
                    active ? "text-indigo-800" : "text-gray-700"
                  }`}
                >
                  {tabCounts[tab.id]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ────────────────────── */}
      {activeTab === "total-order" && (
        <div>
          {/* Table header info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <p className="text-sm text-gray-500">
                {meta
                  ? `${meta.total.toLocaleString()} total orders`
                  : "Loading…"}
              </p>
            </div>
          </div>

          {/* Ant Design Table – fully responsive */}
          <Spin spinning={isLoading} tip="Loading orders…">
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <Table<OrderRow>
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={false}
                pagination={false}
                scroll={{ x: "max-content" }} /* Auto horizontal scroll on mobile */
                rowClassName="hover:bg-gray-50 transition-colors"
                className="w-full min-w-[700px] md:min-w-0" /* Forces scroll on small screens */
                locale={{
                  emptyText: (
                    <Empty
                      description="No orders found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </div>
          </Spin>

          {/* Pagination – responsive & centered on mobile */}
          {meta && meta.total > 0 && (
            <div className="flex justify-center sm:justify-end mt-6 md:mt-8">
              <Pagination
                current={page}
                pageSize={meta.limit}
                total={meta.total}
                onChange={onPageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}–${range[1]} of ${total}`
                }
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "my-shop" && (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-gray-300">
          <Store className="h-12 w-12 mb-3" />
          <p className="text-sm text-gray-400">Shop details coming soon</p>
        </div>
      )}

      {activeTab === "reseller-point" && (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-gray-300">
          <Users className="h-12 w-12 mb-3" />
          <p className="text-sm text-gray-400">Reseller data coming soon</p>
        </div>
      )}
    </div>
  );
}