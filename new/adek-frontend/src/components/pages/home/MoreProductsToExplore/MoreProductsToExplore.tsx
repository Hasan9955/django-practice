"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import Swal from "sweetalert2";
import PriceDisplay from "@/components/PriceDisplay";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  productName: string;
  basePrice: number;
  avgRating: number;
  totalSale: number;
  productStatus: string;
  discountPrice: number;
  productPhoto: string[];
  category: ProductCategory;
}

// ─── Blur placeholder (tiny grey SVG) ───────────────────────────────────────
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+";
const FALLBACK_IMG =
  "https://www.freepik.com/free-vector/illustration-gallery-icon_2922280.htm#fromView=keyword&page=1&position=0&uuid=102d3b35-47f2-4d9f-9397-631ec4251dae&query=Placeholder+placeholders";

// ─── Status badge config ─────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  "top-selling": "bg-amber-400 text-amber-900",
  "super-deal": "bg-emerald-400 text-emerald-900",
  "stock-out": "bg-red-500 text-white",
  "flash-sale": "bg-cyan-400 text-cyan-900",
  NewArrival: "bg-blue-600 text-white",
};
const STATUS_LABELS: Record<string, string> = {
  "top-selling": "Top Selling",
  "super-deal": "Super Deal",
  "stock-out": "Stock Out",
  "flash-sale": "Flash Sale",
  NewArrival: "New Arrival",
};

// ─── Star rating renderer ─────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
            fill="none"
          >
            <path
              d="M4.36875 15.75L5.5875 10.4813L1.5 6.9375L6.9 6.46875L9 1.5L11.1 6.46875L16.5 6.9375L12.4125 10.4813L13.6312 15.75L9 12.9562L4.36875 15.75Z"
              fill={filled || half ? "#FACC15" : "#D1D5DB"}
            />
          </svg>
        );
      })}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const imageSrc = Array.isArray(product.productPhoto)
    ? product.productPhoto[0] || FALLBACK_IMG
    : product.productPhoto || FALLBACK_IMG;

  const discountPct =
    product.basePrice > 0
      ? Math.round(
          ((product.basePrice - product.discountPrice) / product.basePrice) *
            100,
        )
      : 0;

  const statusStyle =
    STATUS_STYLES[product.productStatus] ?? "bg-gray-700 text-white";
  const statusLabel =
    STATUS_LABELS[product.productStatus] ?? product.productStatus;

  return (
    <article
      onClick={onClick}
      className="
        group relative bg-white rounded-2xl overflow-hidden
        shadow-sm hover:shadow-xl
        border border-transparent hover:border-blue-100
        transition-all duration-300 ease-out
        cursor-pointer flex flex-col
      "
      aria-label={`View ${product.productName}`}
    >
      {/* ── Discount ribbon ── */}
      {discountPct > 0 && (
        <div
          className="
            absolute top-3 right-3 z-10
            bg-red-500 text-white text-[10px] sm:text-xs font-bold
            px-2 py-0.5 rounded-full shadow
          "
        >
          -{discountPct}%
        </div>
      )}

      {/* ── Image ── */}
      <div className="relative w-full h-44 sm:h-48 md:h-44 lg:h-48 xl:h-52 overflow-hidden bg-gray-50">
        <Image
          src={imageSrc}
          alt={product.productName || "Product image"}
          fill
          sizes="
            (max-width: 576px)  100vw,
            (max-width: 768px)  50vw,
            (max-width: 992px)  50vw,
            (max-width: 1200px) 33vw,
            25vw
          "
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.srcset = FALLBACK_IMG;
              img.src = FALLBACK_IMG;
              img.dataset.fallback = "true";
            }
          }}
        />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1">
        {/* Product name */}
        <h3
          className="
    text-sm sm:text-[15px] lg:text-[16px] font-semibold
    text-gray-800 leading-snug
    line-clamp-1 group-hover:text-blue-700 transition-colors
  "
        >
          {product.productName}
        </h3>

        {/* Rating + sales */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.avgRating} />
          {product.totalSale > 0 && (
            <span className="text-[11px] text-gray-400 font-medium">
              {product.totalSale}+ sold
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <PriceDisplay
            basePrice={product.discountPrice}
            showCode={false}
            className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700"
          />

          {product.basePrice > product.discountPrice && (
            <PriceDisplay
              basePrice={product.basePrice}
              showCode={false}
              className="text-xs sm:text-sm text-gray-400 line-through"
            />
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span
            className={`
              text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full
              ${statusStyle}
            `}
          >
            {statusLabel}
          </span>
          {discountPct > 0 && (
            <span className="text-[11px] sm:text-xs text-red-500 font-semibold flex items-center gap-1">
              Save
              <PriceDisplay
                basePrice={product.basePrice - product.discountPrice}
                showCode={false}
              />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton loader cards ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-44 sm:h-48 bg-gray-200" />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MoreProductsToExplore() {
  const router = useRouter();
  const { data, isLoading } = useGetAllProductQuery({ search: "" });
  const [visibleCount, setVisibleCount] = useState(8);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const products = data?.result?.data || [];
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleViewMore = () => setVisibleCount((prev) => prev + 8);

  const handleProductClick = (productId: string) => {
    if (!user) {
      Swal.fire({
        title: "Login to Explore NicheHub",
        html: `Thank you for visiting our store.<br><br><strong>Login now to explore all products!</strong>`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Close",
        confirmButtonColor: "#004899",
      }).then((result) => {
        if (result.isConfirmed) router.push("/auth/login");
      });
      return;
    }
    router.push(`/products/${productId}`);
  };

  return (
    <section
      className="
        bg-[#f9f5ff]
        py-8 sm:py-10 md:py-12 lg:py-14
        px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16
      "
      aria-labelledby="more-to-explore-heading"
    >
      <div className="max-w-screen-xl mx-auto">
        {/* ── Heading ── */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h2
            id="more-to-explore-heading"
            className="
              text-2xl sm:text-3xl md:text-[36px] lg:text-[40px]
              font-extrabold text-gray-800 leading-tight tracking-tight
            "
          >
            More to Explore
          </h2>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Hand-picked products just for you
          </p>
        </div>

        {/* ── Grid ── */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-4 sm:gap-4 md:gap-4 lg:gap-4
          "
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : visibleProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
        </div>

        {/* ── View More button ── */}
        {!isLoading && hasMore && (
          <div className="flex justify-center mt-8 sm:mt-10">
            <button
              onClick={handleViewMore}
              className="
                px-8 sm:px-10 py-2.5 sm:py-3
                text-sm sm:text-base font-semibold
                text-blue-700 bg-white
                border-2 border-blue-600 rounded-full
                hover:bg-blue-600 hover:text-white
                active:scale-95
                transition-all duration-200 shadow-sm
              "
            >
              View More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
