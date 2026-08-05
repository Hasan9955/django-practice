/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams } from "next/navigation";
import { Table } from "@/components/ui/Table/Table";
import Image from "next/image";
import { useGetMyProductOrdersQuery } from "@/redux/features/product/productApi";
import { Skeleton } from "antd";

export type Order = any;

const OrderList = () => {
  const searchParams = useSearchParams();
  const Id = searchParams.get("id") as string;
  const userId = Id;

  const { data, isLoading, error } = useGetMyProductOrdersQuery(userId);

  const orders = data?.result?.data || [];

  const columns = [
    {
      header: "Product",
      accessor: "product",
      className: "pl-4 pr-12",
      render: (row: Order) => {
        const product = row.variant?.product;
        const productImage = product?.productPhoto?.[0] || "/placeholder.png";
        return (
          <div className="flex items-center">
            <Image
              src={productImage}
              alt={product?.productName || "Product Image"}
              width={75}
              height={65}
              className="w-[55px] h-[45px] object-cover object-center rounded-[12px] mr-4"
            />
            <span>{product?.productName || "Unnamed Product"}</span>
          </div>
        );
      },
    },
    {
      header: "Location",
      accessor: "region",
      className: "px-12",
      render: (row: Order) => row.region || "N/A",
    },
    {
      header: "Order Number",
      accessor: "orderNumber",
      className: "px-12",
      render: (row: Order) => row.orderNumber || "N/A",
    },
    {
      header: "Price",
      accessor: "price",
      className: "px-12",
      render: (row: Order) => `${row.price} ${row.currency || ""}`,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-black font-sans text-2xl font-bold leading-normal">
            Order Overview
          </h2>
          <p className="text-black/70 font-sans text-sm leading-normal">
            Access a comprehensive overview of the order, including item
            details, payment status, <br /> shipping updates, and customer
            information.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <Skeleton active />
        ) : error ? (
          <p className="text-red-500">Failed to load orders.</p>
        ) : (
          <Table
            columns={columns}
            data={orders}
            emptyMessage="No orders found"
          />
        )}
      </div>
    </div>
  );
};

export default OrderList;
