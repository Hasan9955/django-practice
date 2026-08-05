/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/select";
import {
  StoreProductCard,
  Product,
} from "@/components/ui/Card/StoreProductCard";
import { ApiProduct, useGetProductStoreIdQuery } from "@/redux/features/storeapi/storeApi";


// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const PRICE_RANGES = [
  { label: "$0 – $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $150", min: 100, max: 150 },
  { label: "$150 – $500", min: 150, max: 500 },
  { label: "$500+", min: 500, max: undefined },
] as const;

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Brown", value: "#8B4513" },
  { name: "Orange", value: "#FF6B35" },
  { name: "Slate", value: "#6B7280" },
  { name: "Navy", value: "#1E3A5F" },
] as const;

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low-high", label: "Price: Low → High" },
  { value: "price-high-low", label: "Price: High → Low" },
  { value: "top-selling", label: "Top Selling" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// ─── Skeleton card ────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl bg-white overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[4/5] w-full" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Filter section wrapper ───────────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 cursor-pointer group">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">
            {title}
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${
              open ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ─── Active filter pill ───────────────────────────────────────────────────────

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

export default function ProductListing() {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = path.split("/")[2];

  // ── Filter state (URL-synced) ──────────────────────────────────────────────
  const selectedCategory = searchParams.get("category");
  const selectedSizes = useMemo(
    () => searchParams.get("sizes")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const selectedColors = useMemo(
    () => searchParams.get("colors")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const priceMin = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const priceMax = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const sortBy: SortValue =
    (searchParams.get("sort") as SortValue) ?? "default";
  const page = Number(searchParams.get("page") ?? "1");

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  // ── URL helper ─────────────────────────────────────────────────────────────
  const setParam = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === "") params.delete(key);
        else params.set(key, val);
      });
      // Reset to page 1 on filter change (except explicit page update)
      if (!("page" in updates)) params.set("page", "1");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Derived API args ───────────────────────────────────────────────────────
  const topSelling = sortBy === "top-selling" ? true : undefined;

  const { data, isLoading, isError, isFetching } = useGetProductStoreIdQuery({
    storeId,
    page,
    limit: PAGE_SIZE,
    minPrice: priceMin,
    maxPrice: priceMax,
    topSelling,
    categoryId: selectedCategory,
    sizes: selectedSizes.join(",") || undefined,
    colors: selectedColors.join(",") || undefined,
  });

  const apiProducts: ApiProduct[] = data?.result?.products ?? [];
  const meta = data?.result?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // ── Categories: prefer dedicated endpoint, fall back to deriving from products
  // If you add useGetStoreCategoriesQuery, swap the comment below:
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    apiProducts.forEach((p) => {
      if (p.category?.id) map.set(p.category.id, p.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [apiProducts]);

  // ── Client-side sort (price sorts only — topSelling already handled by API) ─
  const sortedProducts = useMemo(() => {
    const copy = [...apiProducts];
    if (sortBy === "price-low-high")
      return copy.sort((a, b) => a.discountPrice - b.discountPrice);
    if (sortBy === "price-high-low")
      return copy.sort((a, b) => b.discountPrice - a.discountPrice);
    if (sortBy === "newest")
      return copy.filter((p) => p.productStatus === "NewArrival");
    return copy;
  }, [apiProducts, sortBy]);

  // ── Transform for card component ───────────────────────────────────────────
  const transformedProducts: Product[] = useMemo(
    () =>
      sortedProducts.map((p) => ({
        id: p.id,
        name: p.productName,
        price: p.discountPrice,
        originalPrice: p.basePrice,
        image: p.productPhoto[0] ?? "/placeholder.png",
        rating: p.avgRating,
        reviewCount: p.totalSale,
        isWishlisted: wishlistedIds.has(p.id),
        badge: p.productStatus === "NewArrival" ? "New Arrival" : undefined,
        status: p.productStatus,
      })),
    [sortedProducts, wishlistedIds],
  );

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((id: string) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const openProduct = useCallback(
    (id: string) => router.push(`/products/${id}`),
    [router],
  );

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setParam({ sizes: next.join(",") || undefined });
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setParam({ colors: next.join(",") || undefined });
  };

  const handlePriceRange = (min: number, max?: number) => {
    // Clicking the active range deselects it
    if (priceMin === min && priceMax === max) {
      setParam({ minPrice: undefined, maxPrice: undefined });
    } else {
      setParam({
        minPrice: String(min),
        maxPrice: max !== undefined ? String(max) : undefined,
      });
    }
  };

  const resetFilters = () => {
    router.replace(`?`, { scroll: false });
  };

  // ── Active filter pills ────────────────────────────────────────────────────
  const activePills = useMemo(() => {
    const pills: { key: string; label: string; onRemove: () => void }[] = [];
    if (selectedCategory) {
      const name =
        categories.find((c) => c.id === selectedCategory)?.name ??
        selectedCategory;
      pills.push({
        key: "cat",
        label: name.replace(/_/g, " "),
        onRemove: () => setParam({ category: undefined }),
      });
    }
    selectedSizes.forEach((s) =>
      pills.push({
        key: `size-${s}`,
        label: s,
        onRemove: () => toggleSize(s),
      }),
    );
    selectedColors.forEach((c) => {
      const name = COLORS.find((col) => col.value === c)?.name ?? c;
      pills.push({
        key: `color-${c}`,
        label: name,
        onRemove: () => toggleColor(c),
      });
    });
    if (priceMin !== undefined) {
      const range = PRICE_RANGES.find(
        (r) => r.min === priceMin && r.max === priceMax,
      );
      pills.push({
        key: "price",
        label: range?.label ?? `$${priceMin}+`,
        onRemove: () => setParam({ minPrice: undefined, maxPrice: undefined }),
      });
    }
    return pills;
  }, [
    selectedCategory,
    selectedSizes,
    selectedColors,
    priceMin,
    priceMax,
    categories,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="bg-white p-5 rounded-xl shadow-sm h-fit sticky top-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-800">Filters</span>
        </div>
        {activePills.length > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              id="all-categories"
              checked={selectedCategory === null}
              onCheckedChange={() => setParam({ category: undefined })}
            />
            <span className="text-sm text-gray-700">All</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                id={cat.id}
                checked={selectedCategory === cat.id}
                onCheckedChange={() =>
                  setParam({
                    category: selectedCategory === cat.id ? undefined : cat.id,
                  })
                }
              />
              <span className="text-sm text-gray-700 capitalize">
                {cat.name.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-11 h-10 rounded-lg text-sm font-medium border transition-all duration-150 ${
                selectedSizes.includes(size)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => {
            const active = selectedColors.includes(color.value);
            return (
              <button
                key={color.value}
                onClick={() => toggleColor(color.value)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                  active
                    ? "border-gray-900 scale-110 shadow-md"
                    : "border-transparent hover:border-gray-300"
                }`}
                style={{ backgroundColor: color.value }}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = priceMin === range.min && priceMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => handlePriceRange(range.min, range.max)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-150 ${
                  active
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="py-6 px-4 sm:px-6 md:px-8 lg:px-10 container xl:px-0">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar – desktop always visible, mobile toggled */}
          <div
            className={`${
              showMobileFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 shrink-0`}
          >
            {sidebarContent}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="mb-5 flex flex-wrap justify-between items-center gap-3">
              <p className="text-gray-500 text-sm">
                {isFetching && !isLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                    Updating…
                  </span>
                ) : (
                  <>{meta?.total ?? 0} products found</>
                )}
              </p>

              <div className="flex gap-2 items-center">
                {/* Mobile filter toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowMobileFilters((p) => !p)}
                >
                  <Filter className="w-4 h-4 mr-1.5" />
                  Filters
                  {activePills.length > 0 && (
                    <span className="ml-1.5 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activePills.length}
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(val) =>
                    setParam({ sort: val === "default" ? undefined : val })
                  }
                >
                  <SelectTrigger className="w-44 md:w-56">
                    <SelectValue placeholder="Sort by…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activePills.map((pill) => (
                  <FilterPill
                    key={pill.key}
                    label={pill.label}
                    onRemove={pill.onRemove}
                  />
                ))}
              </div>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-600 font-medium">
                  Failed to load products.
                </p>
                <p className="text-red-400 text-sm mt-1">
                  Please check your connection and try again.
                </p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && transformedProducts.length === 0 && (
              <div className="bg-white rounded-xl p-14 text-center">
                <p className="text-gray-700 text-lg font-medium">
                  No products found
                </p>
                <p className="text-gray-400 mt-1 text-sm">
                  Try adjusting your filters or search criteria.
                </p>
                {activePills.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-sm text-gray-900 underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Product grid */}
            {!isLoading && !isError && transformedProducts.length > 0 && (
              <div
                className={`grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${
                  isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
              >
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
            )}

            {/* Pagination */}
            {!isLoading && !isError && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setParam({ page: String(page - 1) })}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setParam({ page: String(p) })}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          page === p
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setParam({ page: String(page + 1) })}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
