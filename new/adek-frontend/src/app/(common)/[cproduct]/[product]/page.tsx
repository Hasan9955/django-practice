/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { CategoryProductCard } from "@/components/ui/Card/CategoryProductCard";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";

export default function ProductPage() {
  const params = useParams<{ cproduct?: string; product?: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useGetAllProductQuery({
    categoryId: params?.product,
  });

  const productsRaw = Array.isArray(data?.result?.data) ? data.result.data : [];

  const products = useMemo(
    () =>
      productsRaw.map((p: any) => ({
        id: p.id as string,
        name: p.productName,
        brand: p.category?.name || "Unknown",
        price: p.discountPrice ?? p.basePrice ?? 0,
        originalPrice: p.basePrice ?? 0,
        rating: p.avgRating ?? 0,
        reviewCount: p.totalSale ?? 0,
        image: Array.isArray(p.productPhoto)
          ? p.productPhoto[0]
          : "/placeholder.svg",
        status: p.productStatus,
        badge: p.productStatus === "NewArrival" ? "New" : undefined,
        isWishlisted: false,
      })),
    [productsRaw]
  );

  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (products.length > 0) {
      const initialWishlist = new Set<string>(
        products
          .filter((p: any) => p.isWishlisted)
          .map((p: any) => p.id)
          .filter((id: any): id is string => typeof id === "string")
      );
      setWishlistedIds(initialWishlist);
    }
  }, [products]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const openProduct = useCallback(
    (id: string) => {
      router.push(`/products/${id}`);
    },
    [router]
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading...
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        Error loading product data.
      </div>
    );

  return (
    <main className="xl:w-[1200px] mx-auto px-4 py-8 sm:py-8 lg:py-14">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product: any) => (
          <CategoryProductCard
            key={product.id}
            product={product}
            wishlisted={wishlistedIds.has(product.id)}
            onToggleWishlist={toggleWishlist}
            onOpen={openProduct}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-sm text-muted-foreground mt-8 text-center">
          No products found in this category yet.
        </div>
      )}
    </main>
  );
}
