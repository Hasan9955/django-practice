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
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: string;
  image?: string;
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

export function CategoryProductCard({
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
      if (e.key === "Enter") onOpen(product.id);
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

  // --- Defensive normalizations ---
  const priceNum =
    typeof product.price === "number" && !Number.isNaN(product.price)
      ? product.price
      : 0;

  const originalPriceNum =
    typeof product.originalPrice === "number" &&
    !Number.isNaN(product.originalPrice)
      ? product.originalPrice
      : 0;

  const ratingNum =
    typeof product.rating === "number" && !Number.isNaN(product.rating)
      ? product.rating
      : 0;

  const reviewCountNum =
    typeof product.reviewCount === "number" &&
    !Number.isNaN(product.reviewCount)
      ? product.reviewCount
      : 0;

  // Calculate discount percentage safely
  const discountPercentage =
    originalPriceNum > priceNum && originalPriceNum > 0
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : 0;

  // Format reviews text
  const reviewsText =
    product.reviews ||
    (reviewCountNum !== undefined
      ? `(${reviewCountNum}) Customer Reviews`
      : "(0) Customer Reviews");

  // Safe image string before using .includes
  const imageSrc =
    typeof product.image === "string" && product.image.length > 0
      ? product.image
      : "/placeholder.svg";
  const isUnoptimized =
    typeof imageSrc === "string" && imageSrc.includes("digitaloceanspaces.com");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 rounded-lg"
      aria-label={`Open ${product.name ?? "product"}`}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={product.name ?? "product image"}
            width={300}
            height={300}
            className="w-full h-64 object-cover bg-gray-100"
            unoptimized={isUnoptimized}
          />
          {product.badge && (
            <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
              {product.badge}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={handleWishlistClick}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 ${
                wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name ?? "Unnamed product"}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
          )}

          <div
            className="flex items-center mb-2"
            aria-label={`Rating ${ratingNum} out of 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < Math.floor(ratingNum)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            {ratingNum > 0 && (
              <span className="text-xs text-gray-600 ml-1">
                ({ratingNum.toFixed(1)})
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3">{reviewsText}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PriceDisplay
                basePrice={priceNum}
                showCode={false}
                className="font-semibold text-gray-900"
              />
              {originalPriceNum > priceNum && (
                <PriceDisplay
                  basePrice={originalPriceNum}
                  showCode={false}
                  className="text-sm text-gray-500 line-through"
                />
              )}
            </div>

            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="text-xs text-white hover:bg-red-600 hover:text-white duration-300"
              >
                -{discountPercentage}% OFF
              </Badge>
            )}

            {product.status && discountPercentage === 0 && (
              <Badge
                variant="secondary"
                className="text-xs hover:bg-gray-200 duration-300"
              >
                {product.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryProductCard;
