/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { ArrowRight, MapPin, Shield, UserPlus } from "lucide-react";
// import Image from "next/image";
// import { MdOutlineTimer } from "react-icons/md";
// import { Button } from "@/components/ui/Button/Button";
// import { CiDiscount1 } from "react-icons/ci";
// import { GiWorld } from "react-icons/gi";
// import { Table } from "@/components/ui/Table/Table";
// import { useSearchParams } from "next/navigation";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/Badge/badge";
// import { cn } from "@/lib/utils";
// import { Modal } from "antd"; // ← Ant Design Modal
// import { useState } from "react";
// import { useGetOtherProfileQuery } from "@/redux/features/auth/authApi";
// import { useGetProductStoreIdQuery } from "@/redux/features/storeapi/storeApi";

// // ─────────────────────────────────────────────────────────────
// // STRICT INTERFACES (no `any`)
// // ─────────────────────────────────────────────────────────────
// interface UserProfile {
//   id: string;
//   fullName: string;
//   location: string | null;
//   Profile: null;
//   profileImage: string;
//   coverPhoto: string;
//   rewardPoint: number;
//   role: string;
//   UserSubscription?: {
//     id: string;
//     userId: string;
//     subscriptionId: string;
//     status: "ACTIVE" | "INACTIVE";
//     subscription?: { type: string };
//   };
// }

// interface Store {
//   id: string;
//   name: string;
//   shopName: string;
//   shopLogo: string;
//   bannerImage: string;
//   createdAt: string;
//   followers: number;
//   desc: string;
// }

// interface Product {
//   id: string;
//   productName: string;
//   basePrice: number;
//   discountPrice?: number;
//   totalSale: number;
//   avgRating: number;
//   productStatus: string;
//   productPhoto: string[];
//   category?: {
//     id: string;
//     name: string;
//   } | null;
// }

// // ─────────────────────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────────────────────
// const SellerProductsProfile = () => {
//   const searchParams = useSearchParams();

//   const sellerId = searchParams.get("sellerId");
//   const storeId = searchParams.get("storeId");

//   const { data: profileData, isLoading: isProfileLoading } =
//     useGetOtherProfileQuery(sellerId!, { skip: !sellerId });

//   const { data: productsData, isLoading: isProductsLoading } =
//     useGetProductStoreIdQuery(
//       { storeId: storeId!, page: 1, limit: 20 },
//       { skip: !storeId },
//     );

//   const profile: UserProfile = profileData?.result ?? ({} as UserProfile);
//   const store: Store = {} as Store;
//   const products: Product[] = productsData?.result?.products ?? [];

//   // Ant Design Modal state
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   const columns = [
//     {
//       header: "Image",
//       accessor: "image" as const,
//       className: "pl-4 pr-12",
//       render: (row: Product) => (
//         <div className="flex items-center">
//           <Image
//             src={row.productPhoto?.[0] || "/placeholder.svg"}
//             alt={row.productName}
//             width={48}
//             height={48}
//             className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
//           />
//         </div>
//       ),
//     },
//     {
//       header: "Product Name",
//       accessor: "productName" as const,
//       className: "px-6 font-medium text-gray-900",
//     },
//     {
//       header: "Category",
//       accessor: "category" as const,
//       className: "px-6",
//       render: (row: Product) => (
//         <Badge variant="outline" className="capitalize text-xs">
//           {row.category?.name || "N/A"}
//         </Badge>
//       ),
//     },
//     {
//       header: "Price",
//       accessor: "price" as const,
//       className: "px-6",
//       render: (row: Product) => (
//         <div className="flex items-baseline gap-x-2">
//           <span className="font-semibold text-xl text-gray-900">
//             {row.discountPrice ?? row.basePrice}
//           </span>
//           {row.discountPrice && row.discountPrice < row.basePrice && (
//             <span className="text-sm text-red-500 line-through">
//               {row.basePrice}
//             </span>
//           )}
//         </div>
//       ),
//     },
//     {
//       header: "Total Sold",
//       accessor: "totalSale" as const,
//       className: "px-6 text-center font-semibold text-emerald-600",
//     },
//     {
//       header: "Rating",
//       accessor: "avgRating" as const,
//       className: "px-6",
//       render: (row: Product) => (
//         <div className="flex items-center gap-1">
//           <span className="font-medium">{row.avgRating}</span>
//           <span className="text-amber-400">★</span>
//         </div>
//       ),
//     },
//     {
//       header: "Status",
//       accessor: "productStatus" as const,
//       className: "px-6",
//       render: (row: Product) => (
//         <Badge
//           variant={row.productStatus === "NewArrival" ? "default" : "secondary"}
//           className={cn(
//             "capitalize hover:bg-red-100",
//             row.productStatus === "NewArrival" &&
//               "bg-emerald-100 text-emerald-700",
//           )}
//         >
//           {row.productStatus}
//         </Badge>
//       ),
//     },
//     {
//       header: "Action",
//       accessor: "details" as const,
//       className: "px-2 text-right",
//       render: (row: Product) => (
//         <Button
//           variant="outline"
//           size="sm"
//           className="hover:bg-blue-50"
//           onClick={() => {
//             setSelectedProduct(row);
//             setIsModalVisible(true);
//           }}
//         >
//           View
//         </Button>
//       ),
//     },
//   ];

//   if (isProfileLoading || isProductsLoading) {
//     return <Skeleton className="h-[520px] w-full rounded-3xl" />;
//   }

//   return (
//     <div className="w-full max-w-screen-2xl mx-auto">
//       {/* Seller Header */}
//       <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
//         <div className="px-8 pt-8 pb-10">
//           <div className="flex flex-col lg:flex-row gap-8 items-start">
//             <div className="flex gap-6">
//               <div className="relative flex-shrink-0">
//                 <Image
//                   src={
//                     profile.profileImage || store.shopLogo || "/placeholder.svg"
//                   }
//                   alt={profile.fullName || "Seller"}
//                   width={110}
//                   height={110}
//                   className=" border-4 w-20 h-20 rounded-full border-white shadow-2xl object-cover"
//                 />
//                 {profile.UserSubscription?.status === "ACTIVE" && (
//                   <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-2xl shadow">
//                     PRO
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <h1 className="text-3xl font-semibold text-white tracking-tight">
//                   {profile.fullName}
//                 </h1>
//                 <p className="text-blue-100 text-xl font-medium mt-1">
//                   {store.shopName}
//                 </p>
//                 <p className="text-blue-100/90 mt-3 max-w-md leading-relaxed">
//                   {store.desc || "No description available."}
//                 </p>

//                 <div className="flex items-center gap-x-6 mt-6 text-sm">
//                   {profile.location && (
//                     <div className="flex items-center gap-2 text-white/90">
//                       <MapPin className="w-4 h-4" />
//                       <span>{profile.location}</span>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-2 text-white/90">
//                     <MdOutlineTimer className="w-4 h-4" />
//                     <span>4+ Years on Sellapy</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 lg:ml-auto flex flex-col lg:items-end gap-5">
//               <div className="flex flex-wrap gap-3">
//                 <Button
//                   variant="secondary"
//                   className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner"
//                 >
//                   Store Products
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner flex items-center gap-2"
//                 >
//                   <CiDiscount1 className="text-xl" />
//                   Discounts Available
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner"
//                 >
//                   Store Highlights
//                 </Button>
//               </div>

//               <div className="flex flex-col lg:flex-row items-center gap-8 text-white text-sm">
//                 <div className="flex items-center gap-2">
//                   <UserPlus className="w-5 h-5" />
//                   <div>
//                     <span className="block text-xs opacity-70">Following</span>
//                     <span className="font-semibold text-lg">
//                       {store.followers ?? 0}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <GiWorld className="w-5 h-5" />
//                   <div>
//                     <span className="block text-xs opacity-70">Response</span>
//                     <span className="font-semibold">Quick • Send Inquiry</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Shield className="w-5 h-5" />
//                   <div className="text-xs opacity-70">30-day easy return</div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <ArrowRight className="w-5 h-5" />
//                   <div>
//                     <span className="block text-xs opacity-70">Items sold</span>
//                     <span className="font-semibold text-lg">
//                       {products.reduce((sum, p) => sum + (p.totalSale || 0), 0)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
//         <div className="flex items-center justify-between mb-6">
//           <h4 className="text-2xl font-semibold text-gray-900">All Products</h4>
//           <span className="text-sm text-gray-500 font-medium">
//             {products.length} products • Total sold:{" "}
//             {products.reduce((sum, p) => sum + (p.totalSale || 0), 0)}
//           </span>
//         </div>

//         <div className="w-full">
//           <Table columns={columns} data={products} />
//         </div>
//       </div>

//       {/* Ant Design Modal */}
//       <Modal
//         title="Product Details"
//         open={isModalVisible}
//         onCancel={() => {
//           setIsModalVisible(false);
//           setSelectedProduct(null);
//         }}
//         footer={null}
//         width={700}
//         centered
//       >
//         {selectedProduct && (
//           <div className="space-y-6 py-2">
//             {/* Image */}
//             <div className="flex justify-center">
//               <Image
//                 src={selectedProduct.productPhoto?.[0] || "/placeholder.svg"}
//                 alt={selectedProduct.productName}
//                 width={320}
//                 height={320}
//                 className="rounded-2xl border shadow-md object-cover"
//               />
//             </div>

//             {/* Name & Status */}
//             <div className="flex justify-between items-start">
//               <h2 className="text-3xl font-semibold">
//                 {selectedProduct.productName}
//               </h2>
//               <Badge
//                 variant={
//                   selectedProduct.productStatus === "NewArrival"
//                     ? "default"
//                     : "secondary"
//                 }
//                 className={cn(
//                   "capitalize",
//                   selectedProduct.productStatus === "NewArrival" &&
//                     "bg-emerald-100 text-emerald-700",
//                 )}
//               >
//                 {selectedProduct.productStatus}
//               </Badge>
//             </div>

//             {/* Price */}
//             <div className="flex items-baseline gap-x-3">
//               <span className="text-4xl font-bold text-gray-900">
//                 {selectedProduct.discountPrice ?? selectedProduct.basePrice}
//               </span>
//               {selectedProduct.discountPrice &&
//                 selectedProduct.discountPrice < selectedProduct.basePrice && (
//                   <span className="text-xl text-red-500 line-through">
//                     {selectedProduct.basePrice}
//                   </span>
//                 )}
//             </div>

//             {/* Category & Rating */}
//             <div className="flex items-center gap-8">
//               <div>
//                 <span className="text-xs text-gray-500">Category</span>
//                 <p className="font-medium">
//                   {selectedProduct.category?.name || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <span className="text-xs text-gray-500">Rating</span>
//                 <div className="flex items-center gap-1">
//                   <span className="font-semibold text-xl">
//                     {selectedProduct.avgRating}
//                   </span>
//                   <span className="text-amber-400 text-2xl">★</span>
//                 </div>
//               </div>
//             </div>

//             {/* Total Sold */}
//             <div>
//               <span className="text-xs text-gray-500">Total Sold</span>
//               <p className="text-2xl font-semibold text-emerald-600">
//                 {selectedProduct.totalSale} units
//               </p>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default SellerProductsProfile;
"use client";

import { ArrowRight, MapPin, Shield, UserPlus } from "lucide-react";
import Image from "next/image";
import { MdOutlineTimer } from "react-icons/md";
import { Button } from "@/components/ui/Button/Button";
import { CiDiscount1 } from "react-icons/ci";
import { GiWorld } from "react-icons/gi";
import { Table } from "@/components/ui/Table/Table";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/Badge/badge";
import { cn } from "@/lib/utils";
import { Modal } from "antd"; // ← Ant Design Modal
import { useEffect, useMemo, useState } from "react";
import { useGetOtherProfileQuery } from "@/redux/features/auth/authApi";
import { useGetProductStoreIdQuery } from "@/redux/features/storeapi/storeApi";

// ─────────────────────────────────────────────────────────────
// STRICT INTERFACES (no `any`)
// ─────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  fullName: string;
  location: string | null;
  Profile: null;
  profileImage: string;
  coverPhoto: string;
  rewardPoint: number;
  role: string;
  createdAt?: string;
  totalSales?: number;
  totalFollower?: number;
  UserSubscription?: {
    id: string;
    userId: string;
    subscriptionId: string;
    status: "ACTIVE" | "INACTIVE";
    subscription?: { type: string };
  } | null;
}

interface Store {
  id: string;
  name: string;
  shopName: string;
  shopLogo: string;
  bannerImage: string;
  createdAt: string;
  followers: number;
  desc: string;
}

interface Product {
  id: string;
  productName: string;
  basePrice: number;
  discountPrice?: number;
  totalSale: number;
  avgRating: number;
  productStatus: string;
  productPhoto: string[];
  category?: {
    id: string;
    name: string;
  } | null;
  __rowNumber?: number;
}

// The `useGetProductStoreIdQuery` hook's generated type only declares
// `{ products, meta }` for `result`, but the API actually also returns a
// `storeInfo` object (see the sample response). Rather than editing the
// generated RTK Query types, we describe the real shape here and cast the
// response into it once, right where it comes out of the hook.
interface StoreProductsResult {
  products: Product[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  };
  storeInfo?: {
    id: string;
    fullName: string;
    location: string | null;
    createdAt: string;
    store: Store[];
    _count?: { Order: number };
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// Truncates a long product name to a max word count, keeping the full
// name available on hover via the `title` attribute.
function truncateProductName(name: string, maxWords: number = 7) {
  if (!name) return "Unknown";
  const words = name.trim().split(/\s+/);
  if (words.length <= maxWords) return name;
  return words.slice(0, maxWords).join(" ") + "...";
}

// discountPrice can legitimately be 0 (meaning "no discount set"), so we
// can't just do `discountPrice ?? basePrice` — that would show a $0 price.
// A discount only counts if it's a positive number lower than basePrice.
function getEffectivePrice(
  product: Pick<Product, "basePrice" | "discountPrice">,
) {
  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice > 0 &&
    product.discountPrice < product.basePrice;

  return {
    hasDiscount,
    displayPrice: hasDiscount ? product.discountPrice! : product.basePrice,
    originalPrice: product.basePrice,
  };
}

// Turns a creation date into a friendly "time on platform" string instead
// of a hardcoded placeholder.
function getTimeOnPlatform(createdAt?: string | null): string {
  if (!createdAt) return "New on Sellapy";
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return "New on Sellapy";

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  months = Math.max(0, months);

  if (months < 1) return "New on Sellapy";
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} on Sellapy`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder > 0
    ? `${years}+ year${years > 1 ? "s" : ""} on Sellapy`
    : `${years} year${years > 1 ? "s" : ""} on Sellapy`;
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS TABLE (table + pagination bundled together, same pattern
// used for the New Listings table in MarketplaceHealth)
// ─────────────────────────────────────────────────────────────

function ProductsTable({ data, columns }: { data: Product[]; columns: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage).map((row, idx) => ({
      ...row,
      __rowNumber: start + idx + 1,
    }));
  }, [data, currentPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

  if (totalItems === 0) {
    return <p className="py-8 text-center text-gray-400">No products found</p>;
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-xl">
        <div className="min-w-[760px]">
          <Table columns={columns} data={paginatedData} />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <span className="text-sm text-gray-500 order-2 sm:order-1">
            Showing {startItem}-{endItem} of {totalItems}
          </span>

          <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              Prev
            </Button>

            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-sm text-gray-400 select-none"
                >
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "bg-blue-600 hover:bg-blue-700 min-w-[36px]"
                      : "min-w-[36px]"
                  }
                >
                  {page}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const SellerProductsProfile = () => {
  const searchParams = useSearchParams();

  const sellerId = searchParams.get("sellerId");
  const storeId = searchParams.get("storeId");

  const { data: profileData, isLoading: isProfileLoading } =
    useGetOtherProfileQuery(sellerId!, { skip: !sellerId });

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductStoreIdQuery(
      { storeId: storeId!, page: 1, limit: 20 },
      { skip: !storeId },
    );

  const profile: UserProfile = profileData?.result ?? ({} as UserProfile);

  // Cast once here — the generated hook type is missing `storeInfo`, even
  // though the API actually returns it (see StoreProductsResult above).
  const productsResult = productsData?.result as
    | StoreProductsResult
    | undefined;

  // The richer store record (desc, followers, createdAt, banner, logo) lives
  // on the products response's `storeInfo.store[0]` — it was previously
  // hardcoded to an empty object, so none of this ever rendered.
  const store: Store = productsResult?.storeInfo?.store?.[0] ?? ({} as Store);

  const products: Product[] = productsResult?.products ?? [];

  // Prefer the profile's own totals (authoritative, includes historical
  // sales even if this page of products doesn't); fall back to summing
  // the currently loaded products.
  const totalItemsSold =
    profile.totalSales ??
    products.reduce((sum, p) => sum + (p.totalSale || 0), 0);
  const totalFollowers = store.followers ?? profile.totalFollower ?? 0;

  // Avatar fallback chain: seller's own profile photo → store logo →
  // a colored initial circle, so there's always something recognizable.
  const avatarUrl = profile.profileImage || store.shopLogo || "";
  const avatarInitial =
    (profile.fullName || store.shopName || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  const timeOnPlatform = getTimeOnPlatform(
    store.createdAt || profile.createdAt,
  );

  // Ant Design Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns = [
    {
      header: "No.",
      accessor: "no" as const,
      className: "pl-4 pr-2 w-12",
      render: (row: Product) => (
        <span className="text-gray-500">{row.__rowNumber ?? "-"}</span>
      ),
    },
    {
      header: "Image",
      accessor: "image" as const,
      className: "pr-12",
      render: (row: Product) => (
        <div className="flex items-center">
          <Image
            src={row.productPhoto?.[0] || "/placeholder.svg"}
            alt={row.productName}
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
          />
        </div>
      ),
    },
    {
      header: "Product Name",
      accessor: "productName" as const,
      className: "px-6 font-medium text-gray-900",
      render: (row: Product) => (
        <span
          className="inline-block max-w-[220px] truncate align-middle"
          title={row.productName}
        >
          {truncateProductName(row.productName, 7)}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: "category" as const,
      className: "px-6",
      render: (row: Product) => (
        <Badge variant="outline" className="capitalize text-xs">
          {row.category?.name?.replace(/_/g, " ") || "N/A"}
        </Badge>
      ),
    },
    {
      header: "Price",
      accessor: "price" as const,
      className: "px-6",
      render: (row: Product) => {
        const { hasDiscount, displayPrice, originalPrice } =
          getEffectivePrice(row);
        return (
          <div className="flex items-baseline gap-x-2">
            <span className="font-semibold text-xl text-gray-900">
              {displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-red-500 line-through">
                {originalPrice}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Total Sold",
      accessor: "totalSale" as const,
      className: "px-6 text-center font-semibold text-emerald-600",
    },
    {
      header: "Rating",
      accessor: "avgRating" as const,
      className: "px-6",
      render: (row: Product) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{row.avgRating}</span>
          <span className="text-amber-400">★</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "productStatus" as const,
      className: "px-6",
      render: (row: Product) => (
        <Badge
          variant={row.productStatus === "NewArrival" ? "default" : "secondary"}
          className={cn(
            "capitalize hover:bg-red-100",
            row.productStatus === "NewArrival" &&
              "bg-emerald-100 text-emerald-700",
          )}
        >
          {row.productStatus}
        </Badge>
      ),
    },
    {
      header: "Action",
      accessor: "details" as const,
      className: "px-2 text-right",
      render: (row: Product) => (
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-blue-50"
          onClick={() => {
            setSelectedProduct(row);
            setIsModalVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  if (isProfileLoading || isProductsLoading) {
    return <Skeleton className="h-[520px] w-full rounded-3xl" />;
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      {/* Seller Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex gap-6">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={profile.fullName || store.shopName || "Seller"}
                    width={110}
                    height={110}
                    className="border-4 w-20 h-20 rounded-full border-white shadow-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full border-4 border-white shadow-2xl flex items-center justify-center bg-white/20 text-white text-3xl font-semibold"
                    title={profile.fullName || store.shopName || "Seller"}
                  >
                    {avatarInitial}
                  </div>
                )}
                {profile.UserSubscription?.status === "ACTIVE" && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-2xl shadow">
                    PRO
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-white tracking-tight">
                  {profile.fullName || "Seller"}
                </h1>
                <p className="text-blue-100 text-xl font-medium mt-1">
                  {store.shopName || "—"}
                </p>
                <p className="text-blue-100/90 mt-3 max-w-md leading-relaxed">
                  {store.desc || "No description available."}
                </p>

                <div className="flex items-center gap-x-6 mt-6 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/90">
                    <MdOutlineTimer className="w-4 h-4" />
                    <span>{timeOnPlatform}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:ml-auto flex flex-col lg:items-end gap-5">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner"
                >
                  Store Products
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner flex items-center gap-2"
                >
                  <CiDiscount1 className="text-xl" />
                  Discounts Available
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-6 py-6 text-base rounded-2xl shadow-inner"
                >
                  Store Highlights
                </Button>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 text-white text-sm">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <div>
                    <span className="block text-xs opacity-70">Following</span>
                    <span className="font-semibold text-lg">
                      {totalFollowers}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GiWorld className="w-5 h-5" />
                  <div>
                    <span className="block text-xs opacity-70">Response</span>
                    <span className="font-semibold">Quick • Send Inquiry</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <div className="text-xs opacity-70">30-day easy return</div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  <div>
                    <span className="block text-xs opacity-70">Items sold</span>
                    <span className="font-semibold text-lg">
                      {totalItemsSold}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-2xl font-semibold text-gray-900">All Products</h4>
          <span className="text-sm text-gray-500 font-medium">
            {products.length} products • Total sold: {totalItemsSold}
          </span>
        </div>

        <div className="w-full">
          <ProductsTable data={products} columns={columns} />
        </div>
      </div>

      {/* Ant Design Modal */}
      <Modal
        title="Product Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedProduct(null);
        }}
        footer={null}
        width={700}
        centered
      >
        {selectedProduct && (
          <div className="space-y-6 py-2">
            {/* Image */}
            <div className="flex justify-center">
              <Image
                src={selectedProduct.productPhoto?.[0] || "/placeholder.svg"}
                alt={selectedProduct.productName}
                width={320}
                height={320}
                className="rounded-2xl border shadow-md object-cover"
              />
            </div>

            {/* Name & Status */}
            <div className="flex justify-between items-start gap-4">
              <h2
                className="text-3xl font-semibold break-words"
                title={selectedProduct.productName}
              >
                {selectedProduct.productName}
              </h2>
              <Badge
                variant={
                  selectedProduct.productStatus === "NewArrival"
                    ? "default"
                    : "secondary"
                }
                className={cn(
                  "capitalize shrink-0",
                  selectedProduct.productStatus === "NewArrival" &&
                    "bg-emerald-100 text-emerald-700",
                )}
              >
                {selectedProduct.productStatus}
              </Badge>
            </div>

            {/* Price */}
            {(() => {
              const { hasDiscount, displayPrice, originalPrice } =
                getEffectivePrice(selectedProduct);
              return (
                <div className="flex items-baseline gap-x-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {displayPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-red-500 line-through">
                      {originalPrice}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Category & Rating */}
            <div className="flex items-center gap-8">
              <div>
                <span className="text-xs text-gray-500">Category</span>
                <p className="font-medium capitalize">
                  {selectedProduct.category?.name?.replace(/_/g, " ") || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Rating</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xl">
                    {selectedProduct.avgRating}
                  </span>
                  <span className="text-amber-400 text-2xl">★</span>
                </div>
              </div>
            </div>

            {/* Total Sold */}
            <div>
              <span className="text-xs text-gray-500">Total Sold</span>
              <p className="text-2xl font-semibold text-emerald-600">
                {selectedProduct.totalSale} units
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerProductsProfile;
