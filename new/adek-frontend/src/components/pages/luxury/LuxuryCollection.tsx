"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StoreProductCard } from "@/components/ui/Card/StoreProductCard";
import { CategoryPills } from "@/components/ui/Tabs/category-pills";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import { Skeleton } from "antd";

// Type definition for API product
interface ApiProduct {
  id: string;
  productName: string;
  basePrice: number;
  avgRating: number;
  totalSale: number;
  productStatus: string;
  discountPrice: number;
  productPhoto: string[];
  category: {
    id: string;
    name: string;
  } | null;
}

// Type definition for transformed product
interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount?: number;
  reviews?: string;
  image: string;
  status?: string;
  badge?: string;
  isWishlisted?: boolean;
}

export default function LuxuryCollection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Fetch products
  const { data, isLoading, isError } = useGetAllProductQuery({
    categoryId: activeCategory === "All" ? undefined : activeCategory,
  });

  // Extract unique categories
  const categories = useMemo(() => {
    if (!data?.result?.data) return [{ id: "All", name: "All" }];

    const categoryMap = new Map<string, string>();
    data.result.data.forEach((product: ApiProduct) => {
      if (product.category) {
        categoryMap.set(product.category.id, product.category.name);
      }
    });

    const categoryList = Array.from(categoryMap.entries()).map(
      ([id, name]) => ({ id, name })
    );

    return [{ id: "All", name: "All" }, ...categoryList];
  }, [data]);

  // Transform API products to component format
  const transformedProducts: Product[] = useMemo(() => {
    if (!data?.result?.data) return [];

    return data.result.data.map((apiProduct: ApiProduct) => ({
      id: apiProduct.id,
      name: apiProduct.productName,
      price: apiProduct.discountPrice,
      originalPrice: apiProduct.basePrice,
      rating: apiProduct.avgRating,
      reviewCount: apiProduct.totalSale,
      reviews: `(${apiProduct.totalSale}) Customer Reviews`,
      image: apiProduct.productPhoto[0] || "/placeholder.svg",
      status: apiProduct.productStatus,
      badge:
        apiProduct.productStatus === "NewArrival" ? "New Arrival" : undefined,
      isWishlisted: false,
    }));
  }, [data]);

  // Wishlist state
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(
    new Set(transformedProducts.filter((p) => p.isWishlisted).map((p) => p.id))
  );

  const toggleWishlist = useCallback((id: string) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Navigation to product detail
  const router = useRouter();
  const openProduct = useCallback(
    (id: string) => {
      router.push(`/products/${id}`);
    },
    [router]
  );

  // --- UI ---

  if (isLoading) {
    return (
      <main className="xl:w-[1200px] mx-auto px-4 py-8 sm:py-8 lg:py-14">
        <Skeleton active />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="xl:w-[1200px] mx-auto px-4 py-8 sm:py-8 lg:py-14">
        <div className="text-center text-red-600">
          Error loading products. Please try again later.
        </div>
      </main>
    );
  }

  return (
    <main className="xl:w-[1200px] mx-auto px-4 py-8 sm:py-8 lg:py-14">
      {/* Category Pills */}
      <div className="mb-6">
        <CategoryPills
          categories={categories.map((c) => c.id)}
          categoryNames={Object.fromEntries(
            categories.map((c) => [c.id, c.name])
          )}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Product Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {transformedProducts.map((product) => (
          <StoreProductCard
            key={product.id}
            product={product}
            wishlisted={wishlistedIds.has(product.id)}
            onToggleWishlist={toggleWishlist}
            onOpen={openProduct}
          />
        ))}
      </div>

      {/* Empty State */}
      {transformedProducts.length === 0 && (
        <div className="text-sm text-muted-foreground mt-8 text-center">
          No products found in this category yet.
        </div>
      )}
    </main>
  );
}
