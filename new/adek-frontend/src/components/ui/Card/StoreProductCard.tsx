"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/badge";
import PriceDisplay from "@/components/PriceDisplay";

export interface Product {
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

type ProductCardProps = {
  product: Product;
  wishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onOpen: (id: string) => void;
};

const defaultProduct: Product = {
  id: "0",
  name: "Product Name",
  brand: "Brand",
  price: 0,
  originalPrice: 0,
  rating: 0,
  reviews: "(0) Customer Reviews",
  image: "/placeholder.svg?height=600&width=600",
  status: "In Stock",
  isWishlisted: false,
};

export function StoreProductCard({
  product = defaultProduct,
  wishlisted = false,
  onToggleWishlist = () => {},
  onOpen = () => {},
}: ProductCardProps) {
  const handleCardClick = useCallback(() => {
    onOpen(product.id);
  }, [onOpen, product.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        onOpen(product.id);
      }
    },
    [onOpen, product.id],
  );

  const handleWishlistClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onToggleWishlist(product.id);
    },
    [onToggleWishlist, product.id],
  );

  // Calculate discount percentage
  const discountPercentage =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  // Format reviews text
  const reviewsText =
    product.reviews ||
    (product.reviewCount !== undefined
      ? `(${product.reviewCount}) Customer Reviews`
      : "(0) Customer Reviews");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 rounded-lg w-full"
      aria-label={`Open ${product.name}`}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative w-full">
          <Image
            src={product.image || "images.png"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full object-cover bg-gray-100 
              h-64 sm:h-56 md:h-60 lg:h-64 xl:h-72"
            unoptimized={product.image.includes("digitaloceanspaces.com")}
          />

          {product.badge && (
            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-600/90 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              {product.badge}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/80 hover:bg-white rounded-full p-1 sm:p-2"
            onClick={handleWishlistClick}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </Button>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base lg:text-lg">
              {product.name}
            </h3>

            {product.brand && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {product.brand}
              </p>
            )}

            {/* Rating */}
            <div
              className="flex items-center mb-2"
              aria-label={`Rating ${product.rating} out of 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm sm:text-base ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
              {product.rating > 0 && (
                <span className="text-xs text-gray-600 ml-1">
                  ({product.rating.toFixed(1)})
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-gray-500 mb-3">
              {reviewsText}
            </p>
          </div>

          {/* Price and Status */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <PriceDisplay
                basePrice={product.price}
                showCode={false}
                className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg"
              />
              {product.originalPrice > product.price && (
                <PriceDisplay
                  basePrice={product.originalPrice}
                  showCode={false}
                  className="text-xs sm:text-sm text-gray-500 line-through"
                />
              )}
            </div>

            {discountPercentage > 0 ? (
              <Badge
                variant="destructive"
                className="text-[10px] sm:text-xs text-white hover:bg-red-600 hover:text-white duration-300"
              >
                -{discountPercentage}% OFF
              </Badge>
            ) : product.status ? (
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs hover:bg-gray-200 duration-300"
              >
                {product.status}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
