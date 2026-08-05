/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Star, MessageCircle, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card/Card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { useGetAllb2bProductQuery } from "@/redux/features/product/productApi";
import PriceDisplay from "@/components/PriceDisplay";
import { BsBoxSeam } from "react-icons/bs";
import { Input, Skeleton } from "antd";
import { useRouter } from "next/navigation";

const { Search } = Input;

/** Returns "10 – 100 moq" from moq / maxMOQ */
const formatRange = (moq: any, maxMOQ: any): string => {
  const min = Number(moq);
  const max = Number(maxMOQ);
  if (isNaN(min)) return "—";
  if (!isNaN(max) && max > min) return `${min} – ${max} moq`;
  return `${min}+ moq`;
};

export default function B2B() {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const { data: res, isLoading, error } = useGetAllb2bProductQuery(search);

  const products: any[] = res?.result?.data || [];

  const handleAntSearch = (value: string) => {
    setSearch(value.trim());
  };

  // ======================== LOADING STATE (Fixed Skeleton) ========================
  if (isLoading) {
    return (
      <div className="min-h-screen pb-40">
        {/* Header + Search (same as loaded state) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <h2 className="text-[#322F35] font-nun text-2xl font-bold">
            Available Sellers
          </h2>

          <div className="w-full sm:w-auto">
            <Search
              placeholder="Search by product name"
              allowClear
              enterButton="Search"
              size="large"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={handleAntSearch}
              className="w-full sm:w-[320px]"
              style={{ maxWidth: "320px" }}
            />
          </div>
        </div>

        <div className="w-full h-px my-5 bg-[#DBDBDB]" />

        {/* Skeleton Grid – FIXED full-width image */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border">
              {/* FIXED: Skeleton.Image now 100% width & height using absolute positioning */}
              <div className="aspect-square relative bg-gray-50 overflow-hidden">
                <Skeleton.Image
                  active
                  className="absolute inset-0 rounded-none"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Product Name */}
                <Skeleton.Input active size="small" block />

                {/* Rating + Packages */}
                <div className="flex items-center gap-3">
                  <Skeleton.Avatar active size="small" />
                  <Skeleton.Input active size="small" style={{ width: 60 }} />
                  <Skeleton.Input active size="small" style={{ width: 90 }} />
                </div>

                {/* Pricing Tiers (3 skeleton rows) */}
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((__, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton.Avatar active size={18} />
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 100 }}
                        />
                      </div>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 80 }}
                      />
                    </div>
                  ))}
                </div>

                {/* Seller + Button */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Skeleton.Avatar active size="large" />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 110 }}
                    />
                  </div>
                  <Skeleton.Button
                    active
                    size="small"
                    shape="circle"
                    style={{ width: 36, height: 36 }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ======================== ERROR STATE ========================
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Oops! Something went wrong.</p>
        <p className="text-sm text-gray-500 mt-2">
          Please refresh or try again later.
        </p>
      </div>
    );
  }

  // ======================== MAIN CONTENT ========================
  return (
    <div className="min-h-screen pb-40">
      {/* Header + Ant Design Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <h2 className="text-[#322F35] font-nun text-2xl font-bold">
          Available Sellers
        </h2>

        <div className="w-full sm:w-auto">
          <Search
            placeholder="Search by product name"
            allowClear
            enterButton="Search"
            size="large"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={handleAntSearch}
            className="w-full sm:w-[320px]"
            style={{ maxWidth: "320px" }}
          />
        </div>
      </div>

      <div className="w-full h-px my-5 bg-[#DBDBDB]" />

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {search
              ? `No products found for "${search}"`
              : "No sellers available yet."}
          </p>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const imageUrl = product.productPhoto?.[0] || "/placeholder.jpg";
            const sellerName = product.seller?.fullName || "Unknown Seller";
            const packages: any[] = Array.isArray(product.packages)
              ? product.packages
              : [];

            return (
              <Card
                key={product.productId}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border"
                onClick={() => router.push(`/products/${product.productId}`)}
              >
                {/* Product Image */}
                <div className="aspect-square relative bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={product.productName || "Product"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Product Name */}
                  <h3 className="font-bold text-lg line-clamp-1">
                    {product.productName || "Unnamed Product"}
                  </h3>

                  {/* Rating + Packages Count */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>({product.avgRating ?? 0})</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {packages.length} tier{packages.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-2">
                    {packages.length > 0 ? (
                      packages.slice(0, 3).map((pkg: any, i: number) => (
                        <div
                          key={pkg.id || i}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <BsBoxSeam className="text-gray-500" />
                            <span className="text-gray-500">
                              {formatRange(pkg.moq, pkg.maxMOQ)}
                            </span>
                          </div>

                          <span className="font-medium text-sm text-blue-600">
                            <PriceDisplay
                              basePrice={pkg.perProductPrice}
                              showCode={false}
                            />
                            /unit
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No pricing available
                      </p>
                    )}
                  </div>

                  {/* Seller + Chat Button */}
                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={product.seller?.profileImage} />
                        <AvatarFallback>
                          {sellerName[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate max-w-[110px]">
                        {sellerName}
                      </span>
                    </div>

                    <Link
                      href={`/account/B2B-portal/messages?sellerId=${product?.seller?.id}&productId=${product?.productId}`}
                    >
                      <button className="bg-blue-600 hover:bg-blue-700 text-white h-9 w-9 flex items-center justify-center rounded-md transition-colors">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </Link>
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
