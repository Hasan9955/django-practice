import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "./Card";
import { Button } from "../Button/Button";
import { BsBoxes } from "react-icons/bs";
import { MdOutlineDateRange } from "react-icons/md";

interface Package {
  id?: string;
  quantity?: string;
  price?: number;
  perProductPrice?: number;
  createdAt?: string;
}

interface Seller {
  id?: string;
  fullName?: string;
  profileImage?: string;
}

export interface Product {
  productId?: string;
  productName?: string;
  productPhoto?: string[];
  avgRating?: number;
  createdAt?: string;
  seller?: Seller;
  packages?: Package[];
}

interface ProductCardProps {
  product?: Product;
  index?: number;
  onEdit?: (product: Product) => void;
  onMessage?: (product: Product) => void;
}

export default function SellerB2BProductCard({
  product,
  index,
  onEdit,
  onMessage,
}: ProductCardProps) {
  if (!product) return null; // prevent rendering if product missing

  return (
    <Card
      key={product?.productId}
      className="overflow-hidden border border-gray-200 shadow-sm"
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
          <Image
            src={product?.productPhoto?.[0] || "/placeholder.svg"}
            alt={product?.productName || "Product"}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />

          {/* Optional badge */}
          {index === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
            {product?.productName || "Untitled Product"}
          </h4>

          {/* Rating + Package Count */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                ({product?.avgRating ?? 0})
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {product?.packages?.length ?? 0}+ Packages
            </span>
          </div>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            {product?.packages?.length ? (
              product.packages.map((pkg, idx) => (
                <div
                  key={pkg?.id || idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <span className="text-xs">
                        <BsBoxes />
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {pkg?.quantity || "N/A"} pcs
                    </span>
                  </div>
                  <span className="font-semibold">
                    ${pkg?.perProductPrice?.toFixed(2) || "0.00"} / pcs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No package data</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MdOutlineDateRange />{" "}
              {product?.createdAt
                ? new Date(product.createdAt).toLocaleDateString()
                : "Unknown"}
            </span>

            <div className="flex gap-2">
              {/* Edit Button */}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-gray-100 hover:bg-gray-200 border-gray-300 hidden"
                  onClick={() => onEdit(product)}
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>
              )}

              {/* Message Seller Button */}
              {onMessage && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 px-4 h-10 hidden"
                  onClick={() => onMessage(product)}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
