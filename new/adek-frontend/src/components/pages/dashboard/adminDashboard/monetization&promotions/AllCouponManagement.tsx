"use client";
import { Table } from "@/components/ui/Table/Table";
import { useGetAllCouponsQuery } from "@/redux/features/dashborad/products/productsApi";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { Skeleton } from "antd"; // ← Added for loading component

export type Coupon = {
  id: string;
  code: string;
  storeId: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  validFrom: string;
  validTill: string;
  createdAt: string;
  updatedAt: string;
};

const AllCouponManagement = () => {
  const { data, isLoading } = useGetAllCouponsQuery({});

  // ==================== LOADING STATE (Ant Design Skeleton) ====================
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Top Bar - Always visible */}
        <div className="flex items-start justify-between w-full mb-5">
          <p className="text-[#2A2A2A] font-sans text-base font-medium">List</p>
          <button className="text-[#FFF] font-nunito text-[16px] font-medium leading-[19.84px] flex p-[10px_12px] items-center gap-[8px] rounded-[12px] bg-[#007BFF]">
            <FaPlus />
            Add new rule
          </button>
        </div>

        {/* Table-like Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Fake Table Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b bg-gray-50">
            <Skeleton.Input active size="small" style={{ width: "85%" }} />
            <Skeleton.Input active size="small" style={{ width: "70%" }} />
            <Skeleton.Input active size="small" style={{ width: "75%" }} />
            <Skeleton.Input active size="small" style={{ width: "68%" }} />
            <Skeleton.Input active size="small" style={{ width: "60%" }} />
            <Skeleton.Input active size="small" style={{ width: "45%" }} />
          </div>

          {/* Fake Table Rows (7 rows to match typical table height) */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 px-6 py-5 border-b last:border-none items-center"
            >
              <Skeleton.Input active size="small" style={{ width: "78%" }} />
              <Skeleton.Input active size="small" style={{ width: "65%" }} />
              <Skeleton.Input active size="small" style={{ width: "55%" }} />
              <Skeleton.Input active size="small" style={{ width: "82%" }} />
              <Skeleton.Input active size="small" style={{ width: "70%" }} />
              {/* Action buttons skeleton */}
              <div className="flex gap-2">
                <Skeleton.Button active size="small" shape="circle" />
                <Skeleton.Button active size="small" shape="circle" />
                <Skeleton.Button active size="small" shape="circle" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== REAL DATA ====================
  const coupons: Coupon[] = data?.result?.data || [];

  const columns = [
    {
      header: "Coupon",
      accessor: "code",
      className: "pl-4 pr-12",
    },
    {
      header: "Discount Type",
      accessor: "discountType",
      className: "px-12",
    },
    {
      header: "Discount Value",
      accessor: "discountValue",
      className: "px-12",
      render: (row: Coupon) => (
        <span className="font-medium">
          {row.discountValue}
          {row.discountType === "PERCENTAGE" ? "%" : " (Fixed)"}
        </span>
      ),
    },
    {
      header: "Start date",
      accessor: "validFrom",
      className: "px-12",
      render: (row: Coupon) => (
        <span>{new Date(row.validFrom).toLocaleDateString("en-US")}</span>
      ),
    },
    {
      header: "End date",
      accessor: "validTill",
      className: "px-12",
      render: (row: Coupon) => (
        <span>{new Date(row.validTill).toLocaleDateString("en-US")}</span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table columns={columns} data={coupons} />
    </div>
  );
};

export default AllCouponManagement;
