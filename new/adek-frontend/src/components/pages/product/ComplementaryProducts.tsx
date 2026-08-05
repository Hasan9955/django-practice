/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Icon2 } from "@/assets/svgIcon";
import PriceDisplay from "@/components/PriceDisplay";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import { Skeleton } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LIMIT = 8;

const ComplementaryProducts = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const { data, isLoading, isError } = useGetAllProductQuery({});
  const router = useRouter();

  const products = data?.result?.data || [];

  // ✅ Format product status - handles camelCase like "NewArrival"
  const formatStatus = (status: string) => {
    if (!status) return "";
    return status
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // ✅ Calculate discount percentage
  const calculateDiscount = (basePrice: number, discountPrice: number) => {
    if (!basePrice || !discountPrice || basePrice <= discountPrice)
      return "0% OFF";
    const discount = ((basePrice - discountPrice) / basePrice) * 100;
    return `${Math.round(discount)}% OFF`;
  };

  // ✅ Get status colors dynamically
  const getStatusColors = (status: string) => {
    const normalizedStatus = (status || "").toLowerCase();

    if (
      normalizedStatus.includes("selling") ||
      normalizedStatus.includes("top")
    ) {
      return { bgColor: "bg-[#FC0]", textColor: "text-color-32" };
    } else if (
      normalizedStatus.includes("deal") ||
      normalizedStatus.includes("super")
    ) {
      return { bgColor: "bg-[#5CD4AB]", textColor: "text-white" };
    } else if (
      normalizedStatus.includes("stock") ||
      normalizedStatus.includes("out")
    ) {
      return { bgColor: "bg-[#E22419]", textColor: "text-white" };
    } else if (
      normalizedStatus.includes("flash") ||
      normalizedStatus.includes("sale")
    ) {
      return { bgColor: "bg-[#00D0E7]", textColor: "text-white" };
    } else {
      return { bgColor: "bg-black", textColor: "text-white" };
    }
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Skeleton active />
      </div>
    );
  }

  // ✅ Error or empty data
  if (isError || products.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-500">No products available</div>
      </div>
    );
  }

  // ✅ Render product grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {/* Slice(4, LIMIT) skips first 4 intentionally. Adjust if not desired */}
      {products.slice(4, LIMIT).map((product: any) => {
        const imageUrl = product.productPhoto?.[0] || "/placeholder-image.jpg";
        const productName = product.productName || "Unnamed Product";
        const soldCount = product.totalSale || 0;
        const currentPrice = product.discountPrice || 0;
        const originalPrice = product.basePrice || 0;
        const status = product.productStatus || "";
        const discount = calculateDiscount(originalPrice, currentPrice);
        const { bgColor, textColor } = getStatusColors(status);

        return (
          <div
            key={product.id}
            className="sm:bg-white bg-gray-100 rounded-[16px] border-[1px] border-gray-200 relative p-2 transition-transform duration-200 hover:scale-[1.02]"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onClick={() => router.push(`/products/${product.id}`)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Product Image */}
            <div className="relative h-40 overflow-hidden">
              <Image
                src={imageUrl || "/images.png"}
                alt={productName}
                fill
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Product Info */}
            <div className="pt-3">
              <h3 className="text-[18px] font-semibold text-color-32 mb-1 line-clamp-1">
                {productName}
              </h3>

              {/* Rating + Sold */}
              <div className="flex items-center mb-1">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Icon2 key={i} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {soldCount}+ Sold
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-end mb-1">
                <PriceDisplay
                  basePrice={currentPrice}
                  showCode={false}
                  className="text-blue-primary font-semibold text-[24px]"
                />
                {originalPrice > currentPrice && (
                  <PriceDisplay
                    basePrice={originalPrice}
                    showCode={false}
                    className="text-[14px] text-color-red line-through ml-1"
                  />
                )}
              </div>

              {/* Status + Discount */}
              <div className="flex items-center gap-[18px]">
                <div
                  className={`text-[12px] font-semibold text-center px-2.5 py-1 rounded-md ${bgColor} ${textColor}`}
                >
                  {formatStatus(status)}
                </div>

                <div className="text-[14px] text-color-red font-semibold">
                  {discount}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplementaryProducts;
