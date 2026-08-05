/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/badge";
import { DatePicker, Select } from "antd";
import type { DatePickerProps } from "antd";
import {
  useGetMyB2BOffersQuery,
  useUpdateB2BOfferStatusMutation,
} from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";

const { Option } = Select;

type OrderStatus = "all" | "pending" | "accepted" | "rejected" | "completed";
type OfferStatus = "REJECTED" | "COMPLETED";

export default function B2BOrdersList() {
  const { data, isLoading, error } = useGetMyB2BOffersQuery({});
  const [updateB2BOfferStatus, { isLoading: isUpdating }] =
    useUpdateB2BOfferStatusMutation();

  // FIX: Derive orders directly from data — avoids creating a new [] reference
  // on every render when data is undefined, which caused the old useEffect to
  // fire in an infinite loop.
  const orders: any[] = data?.result ?? [];

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // FIX: Replaced useEffect + setState with useMemo.
  // - No more eslint-disable react-hooks/exhaustive-deps suppression needed.
  // - No extra render cycle from setState inside an effect.
  // - Derived state is always in sync — no stale-closure risk.
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (selectedDate) {
      const filterDate = selectedDate.format("YYYY-MM-DD");
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === filterDate;
      });
    }

    if (selectedStatus !== "all") {
      result = result.filter(
        (order) => (order.offerStuts || "").toLowerCase() === selectedStatus,
      );
    }

    return result;
  }, [orders, selectedDate, selectedStatus]);

  const onDateChange: DatePickerProps["onChange"] = (date) => {
    setSelectedDate(date);
  };

  const handleStatusUpdate = async (
    orderId: string,
    offerStatus: OfferStatus,
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateB2BOfferStatus({ offerId: orderId, offerStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // FIX: Extracted into a named helper so the per-card JSX is cleaner.
  // Checks BOTH that this specific card is the one being mutated AND that
  // the RTK Query mutation is still in flight — prevents a stale
  // updatingOrderId from disabling buttons after the request settles.
  const isOrderUpdating = (orderId: string) =>
    isUpdating && updatingOrderId === orderId;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Your Order is Pending";
      // FIX: "accepted" case was missing — it silently fell through to the
      // default and showed "Order status updated" instead of a real message.
      case "accepted":
        return "Your Order has been Accepted";
      case "rejected":
        return "Your Order has been Rejected";
      case "completed":
        return "Your Order has been Completed";
      default:
        return "Status unknown";
    }
  };

  // Action buttons are shown only for accepted orders (buyer can mark
  // completed or reject after seller accepts).
  const canUpdateStatus = (status: string) =>
    status?.toLowerCase() === "accepted";

  if (error) {
    return (
      <div className="mt-12 mb-40">
        <Card className="border-red-200">
          <CardContent className="p-12 text-center text-red-600">
            Failed to load B2B orders. Please refresh the page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-40">
      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-6 bg-white p-6 border border-gray-100 rounded-3xl shadow-sm mb-6">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            suffixIcon={<CalendarOutlined className="text-gray-400" />}
            placeholder="Select date"
            style={{ width: "100%", height: "48px", borderRadius: "14px" }}
            className="w-full"
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order status
          </label>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as OrderStatus)}
            placeholder="Select order status"
            style={{ width: "100%", height: "48px", borderRadius: "14px" }}
            className="w-full"
          >
            <Option value="all">All statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="accepted">Accepted</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </div>
      </div>

      {/* ── Orders List ──────────────────────────────────────────────── */}
      {isLoading ? (
        // FIX: Skeleton now mirrors the real card structure exactly:
        // index badge → meta grid (label + value pairs) → product row → status row.
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-100 shadow-sm">
              <CardContent className="p-6 animate-pulse">
                {/* Index badge */}
                <div className="h-9 w-9 bg-gray-200 rounded-2xl mb-6" />

                {/* Meta grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-b pb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>

                {/* Product row */}
                <div className="flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 bg-gray-200 rounded" />
                    <div className="h-4 w-1/4 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Status row */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-7 w-24 bg-gray-200 rounded-2xl" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="p-16 text-center">
            <p className="text-gray-400 text-lg">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => {
            const firstItem = order.offer_Items?.[0];
            const realStatus = order.offerStuts || "pending";
            const isThisUpdating = isOrderUpdating(order.id);

            return (
              <Card
                key={order.id}
                className="border border-gray-100 shadow-sm overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Index badge */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 text-lg font-semibold text-gray-700">
                      {index + 1}
                    </div>
                  </div>

                  {/* Order meta grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-b pb-6">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-semibold text-lg">
                        #{order.id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.seller?.profileImage ? (
                        <Image
                          src={order.seller.profileImage}
                          alt={order.seller.fullName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold">
                          {order.seller?.fullName?.[0] || "S"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Seller</p>
                        <p className="font-medium">{order.seller?.fullName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">
                        {order.offer_Items.reduce(
                          (acc: number, item: any) => acc + item.quantity,
                          0,
                        )}{" "}
                        pcs
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Estimated Delivery D.
                      </p>
                      <p className="font-medium">
                        {new Date(
                          order.expectedDeliveryDate,
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Product preview */}
                  <div className="flex gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border">
                      {firstItem?.product?.productPhoto?.[0] && (
                        <Image
                          src={firstItem.product.productPhoto[0]}
                          alt={firstItem.product.productName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">
                        {firstItem?.product?.productName || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {firstItem?.quantity || 0} pcs
                      </p>
                      {order.offer_Items.length > 1 && (
                        <p className="text-xs text-blue-600 mt-1">
                          + {order.offer_Items.length - 1} more items
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-semibold text-lg text-gray-800">
                        ${order.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status + Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`${getStatusColor(
                          realStatus,
                        )} px-6 py-1 text-sm font-medium rounded-2xl`}
                      >
                        {realStatus}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {getStatusText(realStatus)}
                      </p>
                    </div>

                    {/* Action buttons — only for accepted orders */}
                    {canUpdateStatus(realStatus) && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "COMPLETED")
                          }
                          disabled={isThisUpdating}
                          className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isThisUpdating ? "Updating..." : "Mark Completed"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(order.id, "REJECTED")
                          }
                          disabled={isThisUpdating}
                          className="px-5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isThisUpdating ? "Updating..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
