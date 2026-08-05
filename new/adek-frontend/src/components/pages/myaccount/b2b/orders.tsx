/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/badge";
import { DatePicker, Select } from "antd";
import type { DatePickerProps } from "antd";
import { useGetMyB2BOffersQuery } from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";

const { Option } = Select;

export default function OrdersPage() {
  const { data, isLoading, error } = useGetMyB2BOffersQuery({});
  const orders = data?.result ?? [];

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "accepted" | "rejected" | "completed"
  >("all");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  useEffect(() => {
    let filtered = [...orders];

    if (selectedDate) {
      const filterDate = selectedDate.format("YYYY-MM-DD");
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === filterDate;
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => {
        const status = (order.offerStuts || "").toLowerCase();
        return status === selectedStatus;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, selectedDate, selectedStatus]);

  const onDateChange: DatePickerProps["onChange"] = (date) => {
    setSelectedDate(date);
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
		case "pending":
			return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
		case "pending":
			return "Your Order is Pending";
      case "accepted":
        return "Your Order has been Accepted";
      case "rejected":
        return "Your Order has been Rejected";
      case "completed":
        return "Your Order has been Completed";
      default:
        return "Order status updated";
    }
  };

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
      {/* Filters */}
      <div className="flex items-end gap-6 bg-white p-6 border border-gray-100 rounded-3xl shadow-sm">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Order status</label>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as any)}
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

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse flex items-start gap-6">
                  <div className="w-8 h-8 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
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
            const realStatus = order.offerStuts || "accepted";

            return (
              <Card key={order.id} className="border border-gray-100 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 text-lg font-semibold text-gray-700">
                      {index + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-b pb-6">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-semibold text-lg">#{order.id.slice(-8)}</p>
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
                        {order.offer_Items.reduce((acc: number, item: any) => acc + item.quantity, 0)} pcs
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Delivery D.</p>
                      <p className="font-medium">
                        {new Date(order.expectedDeliveryDate).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

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
                      <p className="font-medium text-lg">{firstItem?.product?.productName || "Product"}</p>
                      <p className="text-sm text-gray-500">{firstItem?.quantity || 0} pcs</p>
                      {order.offer_Items.length > 1 && (
                        <p className="text-xs text-blue-600 mt-1">+ {order.offer_Items.length - 1} more items</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <Badge className={`${getStatusColor(realStatus)} px-6 py-1 text-sm font-medium rounded-2xl`}>
                      {realStatus}
                    </Badge>
                    <p className="text-sm text-gray-600">{getStatusText(realStatus)}</p>
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