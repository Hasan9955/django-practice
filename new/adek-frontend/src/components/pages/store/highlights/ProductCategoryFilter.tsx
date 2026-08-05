/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import { Product } from "@/components/ui/Card/ProductCard";
import { Skeleton } from "antd";

// Type for API response
interface ApiCategory {
  id: string;
  name: string;
  displayName?: string;
}

interface ApiProduct {
  id: string;
  productName: string;
  basePrice: number;
  avgRating: number;
  totalSale: number;
  productStatus: string;
  discountPrice: number;
  productPhoto: string[];
  category: ApiCategory | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  result: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
    data: ApiProduct[];
  };
}

// Category type matching CategoryFilter component
interface Category {
  id: string;
  name: string;
  displayName: string;
  categoryPhoto?: string | null;
  parentId?: string | null;
  subCategories?: Category[];
}

const ProductCategoryFilter = () => {
  // ✅ FIX 1: Use "all" instead of "All" to match CategoryFilter default
  const [categoryId, setCategory] = useState<string>("all");

  // ✅ FIX 2: Fetch products with proper categoryId handling
  const { data, isLoading, isError, refetch } = useGetAllProductQuery({
    categoryId: categoryId === "all" ? undefined : categoryId,
  });

  // ✅ FIX 3: Refetch when category changes
  useEffect(() => {
    if (categoryId !== "all") {
      refetch();
    }
  }, [categoryId, refetch]);

  // ✅ FIX 4: Extract and transform categories to match CategoryFilter interface
  const categories = useMemo(() => {
    // ✅ Return empty array if no data or data structure is invalid
    if (!data?.result?.data || !Array.isArray(data.result.data)) {
      return [];
    }

    const categoryMap = new Map<string, ApiCategory>();

    // ✅ Safely iterate through products
    data.result.data.forEach((product: ApiProduct) => {
      if (product?.category && !categoryMap.has(product.category.id)) {
        categoryMap.set(product.category.id, product.category);
      }
    });

    // Transform to match CategoryFilter's Category interface
    return Array.from(categoryMap.values()).map((cat) => ({
      id: cat.id,
      name: cat.name,
      displayName: cat.displayName || cat.name, // Use displayName if available, fallback to name
      categoryPhoto: null,
      parentId: null,
      subCategories: [],
    }));
  }, [data]);

  // ✅ FIX 5: Transform API products to component Product type
  const transformedProducts: Product[] = useMemo(() => {
    if (!data?.result?.data) return [];

    return data.result.data.map((apiProduct: ApiProduct) => {
      const discountPercentage =
        apiProduct.basePrice > apiProduct.discountPrice
          ? Math.round(
              ((apiProduct.basePrice - apiProduct.discountPrice) /
                apiProduct.basePrice) *
                100
            )
          : 0;

      return {
        id: apiProduct.id,
        name: apiProduct.productName,
        image: apiProduct.productPhoto?.[0] || "/placeholder.svg",
        category: apiProduct.category?.name || "Uncategorized",
        price: apiProduct.discountPrice,
        originalPrice: apiProduct.basePrice,
        soldCount: apiProduct.totalSale,
        rating: apiProduct.avgRating,
        status: apiProduct.productStatus,
        discountPercentage: discountPercentage,
        freeShipping: false,
        freeShippingThreshold: 0,
        colors: [],
        sizes: [],
      };
    });
  }, [data]);

  // ✅ FIX 6: Handle category selection with proper type
  const handleCategorySelect = (selectedCategoryId: string) => {
    setCategory(selectedCategoryId);
    
    // Optional: Scroll to products section
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ FIX 7: Calculate filtered count for display
  const totalProducts = data?.result?.meta?.total || transformedProducts.length;
  const filteredCount = transformedProducts.length;

  return (
    <div className="w-full h-auto bg-white py-4 md:py-8 xl:py-12">
      <section className="xl:w-[1220px] mx-auto px-4">
        {/* ✅ FIX 8: Proper CategoryFilter usage with all required props */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={categoryId}
            onSelect={handleCategorySelect}
            showAllOption={true}
            allOptionLabel="All Products"
            showSubCategories={false}
          />
        </div>

        {/* ✅ FIX 9: Improved loading and error states */}
        <div className="mt-6 md:mt-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton active paragraph={{ rows: 4 }} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading products
              </h3>
              <p className="text-gray-600 text-center mb-4">
                We couldn&apos;t load the products. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : transformedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {categoryId === "all"
                  ? "There are no products available at the moment."
                  : "No products found in this category. Try selecting a different category."}
              </p>
              {categoryId !== "all" && (
                <button
                  onClick={() => handleCategorySelect("all")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={transformedProducts} />
              
              {/* ✅ FIX 10: Show product count */}
              {filteredCount > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    {categoryId === "all" ? (
                      <>Showing all <span className="font-semibold">{filteredCount}</span> products</>
                    ) : (
                      <>
                        Showing <span className="font-semibold">{filteredCount}</span>{" "}
                        {filteredCount === 1 ? "product" : "products"} in this category
                      </>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductCategoryFilter;