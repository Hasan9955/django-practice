"use client";

import { Suspense } from "react";
import { Search, Star, ShoppingCart } from "lucide-react";
import { useGetAllProductQuery } from "@/redux/features/product/productApi";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productName: string;
  basePrice: number;
  discountPrice?: number;
  productPhoto?: string[];
  avgRating?: number;
  category?: Category | null;
  productStatus?: string;
  totalSale?: number;
}

// ============================================
// PRODUCT CARD - IMPROVED DESIGN
// ============================================
const ProductCard = ({ product }: { product: Product }) => {
  const displayPrice = product.discountPrice || product.basePrice;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.basePrice - product.discountPrice!) / product.basePrice) *
          100,
      )
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="group h-full">
      <div className="h-full bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl flex flex-col">
        {/* Product Image Container */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          {product.productPhoto && product.productPhoto.length > 0 ? (
            <Image
              width={400}
              height={400}
              src={product.productPhoto[0] || "/placeholder.svg"}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Search className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              {discountPercent}% OFF
            </div>
          )}

          {product.productStatus && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              {product.productStatus}
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info - Improved Layout */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category Badge */}
          {product.category && (
            <div className="mb-2.5">
              <span className="inline-block bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-medium">
                {product.category.name}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-sm leading-5 text-gray-900 line-clamp-2 mb-3 min-h-10">
            {product.productName}
          </h3>

          {(product.avgRating !== undefined ||
            product.totalSale !== undefined) && (
            <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
              {product.avgRating !== undefined && product.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {product.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
              {product.totalSale !== undefined && product.totalSale > 0 && (
                <>
                  {product.avgRating !== undefined && (
                    <span className="text-gray-300">•</span>
                  )}
                  <span className="text-gray-500">
                    {product.totalSale} sold
                  </span>
                </>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-orange-600">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.basePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
      >
        <div className="w-full aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-auto"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 bg-white rounded-lg shadow">
    <Search className="w-24 h-24 text-gray-300 mx-auto mb-4" />
    <h3 className="text-3xl font-bold mb-3">No products found</h3>
    <p className="text-gray-600 text-lg mb-6">
      Enter a search term to find products
    </p>
    <Link
      href="/"
      className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
    >
      Back to Home
    </Link>
  </div>
);

const ErrorState = () => (
  <div className="text-center py-20 bg-white rounded-lg shadow">
    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-4xl">⚠️</span>
    </div>
    <h3 className="text-3xl font-bold mb-3 text-red-600">
      Error Loading Products
    </h3>
    <p className="text-gray-600 text-lg mb-6">
      Something went wrong while searching. Please try again.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
    >
      Retry
    </button>
  </div>
);

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetAllProductQuery({
    search: query,
  });
  console.log(productsData , "search data");

  // Extract products from nested structure: result.data
  const products: Product[] = productsData?.result?.data || [];
  const totalProducts = productsData?.result?.meta?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            {query ? `Search Results for "${query}"` : "Search Products"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isLoading
              ? "Searching..."
              : error
                ? "Error occurred"
                : query
                  ? `${totalProducts} ${totalProducts === 1 ? "product" : "products"} found`
                  : "Enter a search term to begin"}
          </p>
        </div>

        {/* Products Grid */}
        {error ? (
          <ErrorState />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading search results...
            </p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
