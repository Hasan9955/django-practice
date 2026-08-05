"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Table } from "@/components/ui/Table/Table";
import Image from "next/image";
import { DeleteIcon } from "@/assets/svgIcon";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { useGetProductStoreIdQuery } from "@/redux/features/storeapi/storeApi";
import { useDeleteProductMutation } from "@/redux/features/dashborad/products/productsApi";
import toast from "react-hot-toast";

interface ProductData {
  id: string;
  productName: string;
  basePrice: number;
  discountPrice: number; // ✅ added — present in API
  totalSales: number; // mapped from API "totalSale"
  totalRevenue: number; // calculated (basePrice × totalSale)
  productPhoto: string[];
  createdAt: string | Date; // optional — not always in API
}

// ✅ Typed API product item to eliminate `any` in the map
interface RawProduct {
  id: string;
  productName: string;
  basePrice: number;
  discountPrice?: number;
  totalSale?: number;
  productPhoto?: string[];
  createdAt?: string;
}

const ITEMS_PER_PAGE = 8;

const SellerProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const storeId = searchParams.get("id") as string;

  const { data, isLoading, refetch } = useGetProductStoreIdQuery({
    storeId,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const [deleteProduct] = useDeleteProductMutation();

  // ✅ FIX: API wraps everything inside `result`, not at the top level
  const rawProducts: RawProduct[] = data?.result?.products || [];

  const products: ProductData[] = rawProducts.map((item) => ({
    id: item.id,
    productName: item.productName,
    basePrice: item.basePrice ?? 0,
    discountPrice: item.discountPrice ?? 0,
    totalSales: item.totalSale ?? 0,
    totalRevenue: (item.basePrice ?? 0) * (item.totalSale ?? 0),
    productPhoto: item.productPhoto ?? [],
    createdAt: item.createdAt ?? new Date().toISOString(), // ✅ safe fallback
  }));

  // ✅ FIX: meta is also nested under `result`
  const totalItems: number = data?.result?.meta?.total ?? 0;
  const totalPages: number = data?.result?.meta?.totalPages ?? 1;

  const columns = [
    {
      header: "Image",
      accessor: "image",
      className: "pl-4 pr-12",
      render: (row: ProductData) => {
        const imageUrl = row.productPhoto?.[0] || "/placeholder.jpg";
        return (
          <div className="flex items-center">
            <Image
              src={imageUrl}
              alt={row.productName} // ✅ more descriptive alt text
              width={75}
              height={65}
              className="w-[55px] h-[45px] object-cover object-center rounded-[12px] mr-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.jpg";
              }}
            />
          </div>
        );
      },
    },
    {
      header: "Product Name",
      accessor: "productName",
      className: "px-12",
    },
    {
      header: "Total Sales",
      accessor: "totalSales",
      className: "px-12",
    },
    {
      header: "Total Revenue",
      accessor: "totalRevenue",
      className: "px-12",
      // ✅ FIX: Format as currency instead of raw number
      render: (row: ProductData) => <span>${row.totalRevenue.toFixed(2)}</span>,
    },
    {
      header: "Delete",
      accessor: "delete",
      className: "px-2",
      render: (row: ProductData) => (
        <div
          onClick={() => handleDelete(row)}
          className="hover:opacity-90 cursor-pointer"
        >
          <DeleteIcon />
        </div>
      ),
    },
  ];

  const handleDelete = async (row: ProductData) => {
    if (!row.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.productName}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteProduct(row.id).unwrap();
      toast.success("Product deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[88vh]">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-black font-sans text-2xl font-bold leading-normal">
              Product Overview
            </h2>
            <p className="text-black/60 font-sans text-sm  leading-normal">
              Access all essential details about the product, including its
              description, pricing, stock, <br /> seller information, and
              performance metrics.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Table columns={columns} data={products} isLoading={isLoading} />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
