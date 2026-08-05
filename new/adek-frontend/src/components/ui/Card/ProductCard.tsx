"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import PriceDisplay from "@/components/PriceDisplay";

export type Product = {
  id: string;
  name: string;
  image?: string | { src?: string };
  category: string;
  price: number | string;
  originalPrice?: number | string;
  soldCount?: number;
  rating?: number;
  status?: "top-selling" | "super-deal" | "stock-out" | "flash-sale" | string;
  discount?: string;
  discountPercentage?: number;
  freeShipping?: boolean;
  freeShippingThreshold?: number;
  colors?: string[];
  sizes?: string[];
};

function formatStatus(status?: Product["status"]) {
  if (!status) return "";
  const map: Record<string, string> = {
    "top-selling": "Top selling",
    "super-deal": "Super deal",
    "stock-out": "Sold out",
    "flash-sale": "Flash sale",
  };
  const key = String(status).toLowerCase();
  return map[key] ?? status;
}

function statusClasses(status?: Product["status"]) {
  const s = String(status || "").toLowerCase();
  let base = "text-white";
  const bg =
    s === "top-selling"
      ? "bg-[#FC0]"
      : s === "super-deal"
      ? "bg-[#5CD4AB]"
      : s === "stock-out"
      ? "bg-[#E22419]"
      : s === "flash-sale"
      ? "bg-[#00D0E7]"
      : "bg-black";
  if (s === "top-selling") base = "text-neutral-900";
  return cn(
    "text-[12px] font-semibold text-nowrap text-center px-2.5 py-1 rounded-md",
    bg,
    base,
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  // Wishlist/compare flags could come from Redux if needed. For now, icons are static.
  const {
    id,
    name,
    image,
    price,
    originalPrice,
    soldCount = 1000,
    rating = 4,
    status,
    discount = "Extra 5% discount running",
  } = product;

  // Your requested Redux add-to-cart mapping

  return (
    <Card
      role="listitem"
      className="bg-white rounded-2xl shadow-sm relative p-2 xl:p-4 cursor-pointer"
      onClick={() => router.push(`/products/${id}`)}
    >
      <div className="relative h-40 sm:h-44 md:h-48 xl:h-52 overflow-hidden">
        <Image
          src={
            typeof image === "string"
              ? image
              : image?.src ||
                "/placeholder.svg?height=208&width=320&query=product%20image"
          }
          alt={name}
          fill
          sizes="(min-width:1280px) 300px, (min-width:1024px) 22vw, (min-width:768px) 30vw, (min-width:640px) 45vw, 50vw"
          className="object-cover rounded-xl"
        />
      </div>

      <div className="pt-3">
        <h3 className="text-[18px] font-semibold text-neutral-900 mb-1 line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center mb-1">
          <div
            className="flex text-black"
            aria-label={`${rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-[18px] w-[18px]",
                  i < Math.round(rating) ? "text-black" : "text-gray-300",
                )}
                stroke="currentColor"
                fill="currentColor"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{soldCount}+ Sold</span>
        </div>
        <div className="flex items-end mb-1">
          <PriceDisplay
            basePrice={Number(price)}
            showCode={false}
            className="text-sky-600 font-semibold text-lg sm:text-[24px]"
          />

          {originalPrice && (
            <PriceDisplay
              basePrice={Number(originalPrice)}
              showCode={false}
              className="text-[14px] text-rose-500 line-through ml-1"
            />
          )}
        </div>
        <div className="flex items-center gap-[18px]">
          {status && (
            <div className={statusClasses(status)}>{formatStatus(status)}</div>
          )}
          {discount && (
            <div className="text-[14px] text-rose-600 font-semibold">
              {discount}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
