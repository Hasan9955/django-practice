// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState, useMemo } from "react";
// import { Table } from "@/components/ui/Table/Table";
// import { Pagination } from "@/components/ui/Pagination/Pagination";
// import { useGetAllSellerStoresQuery } from "@/redux/features/dashborad/sellerStoreApi";

// // ====================== TYPES ======================
// interface Seller {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   companyName: string;
//   profileImage: string;
//   storeId: string | null;
//   totalProducts: number;
//   totalSales: number;
//   totalRevenue: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   result: {
//     meta: {
//       page: number;
//       limit: number;
//       total: number;
//       totalPage: number;
//     };
//     data: Seller[];
//   };
// }

// const ITEMS_PER_PAGE = 12;

// const OrdersSellersList = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const router = useRouter();

//   // RTK Query
//   const { data, isLoading, error } = useGetAllSellerStoresQuery({});

//   const apiData = data as ApiResponse | undefined;
//   const sellers: Seller[] = apiData?.result?.data || [];

//   // Client-side pagination (since backend returns all 15 items with meta)
//   const paginatedSellers = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;
//     return sellers.slice(start, end);
//   }, [sellers, currentPage]);

//   const totalPages = Math.ceil(sellers.length / ITEMS_PER_PAGE);

//   const handleViewDetails = (seller: Seller) => {
//     router.push(`/dashboard/orders&payments/orderlogs/${seller.id}`);
//   };

//   const columns = [
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",
//       render: (row: Seller) => {
//         const imageUrl = row.profileImage || "/placeholder-avatar.png"; // TODO: add proper fallback image
//         return (
//           <div className="flex items-center gap-3">
//             <Image
//               src={imageUrl}
//               alt={row.fullName}
//               width={40}
//               height={40}
//               className="w-10 h-10 object-cover rounded-full"
//             />
//             <div>
//               <p className="font-medium text-black">{row.fullName}</p>
//               <p className="text-sm text-gray-500">{row.email}</p>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Company Name",
//       accessor: "companyName",
//       className: "px-6",
//       render: (row: Seller) => (
//         <span className="text-black">
//           {row.companyName || <span className="text-gray-400">—</span>}
//         </span>
//       ),
//     },
//     {
//       header: "Phone Number",
//       accessor: "phoneNumber",
//       className: "px-6",
//     },
//     {
//       header: "Total Products",
//       accessor: "totalProducts",
//       className: "px-6 text-center",
//     },
//     {
//       header: "Total Sales",
//       accessor: "totalSales",
//       className: "px-6 text-center",
//     },
//     {
//       header: "Total Revenue",
//       accessor: "totalRevenue",
//       className: "px-6 text-center",
//       render: (row: Seller) => (
//         <span className="font-medium">
//           ${row.totalRevenue.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-6",
//       render: (row: Seller) => (
//         <button
//           onClick={() => handleViewDetails(row)}
//           className="rounded-lg bg-blue-500 px-2 py-1 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
//         >
//           View Details
//         </button>
//       ),
//     },
//   ];

//   if (error) {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Failed to load sellers. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-2xl font-bold text-black font-sans">
//             All Sellers List
//           </h2>
//           <p className="text-base font-semibold text-black/70 mt-1">
//             Manage all seller accounts and their performance
//           </p>
//         </div>

//         {/* Date Range Picker - kept but hidden as in original */}
//         <div className="hidden">
//           {/* <RangePicker className="border-[#656562] border h-12" /> */}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mt-6">
//         <Table
//           columns={columns}
//           data={paginatedSellers}
//           isLoading={isLoading}
//         />
//       </div>

//       {/* Pagination */}
//       {sellers.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//           itemsPerPage={ITEMS_PER_PAGE}
//           totalItems={sellers.length}
//         />
//       )}
//     </div>
//   );
// };

// export default OrdersSellersList;

// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState, useMemo, useRef, useCallback } from "react";
// import { Table } from "@/components/ui/Table/Table";
// import { Pagination } from "@/components/ui/Pagination/Pagination";
// import { useGetAllSellerStoresQuery } from "@/redux/features/dashborad/sellerStoreApi";

// // ====================== TYPES ======================
// interface Seller {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   companyName: string;
//   profileImage: string;
//   storeId: string | null;
//   totalProducts: number;
//   totalSales: number;
//   totalRevenue: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   result: {
//     meta: {
//       page: number;
//       limit: number;
//       total: number;
//       totalPage: number;
//     };
//     data: Seller[];
//   };
// }

// const ITEMS_PER_PAGE = 25; // matches the "limit" your API returned in the sample response

// type StoreFilter = "all" | "hasStore" | "noStore";

// // ====================== AVATAR FALLBACK (initials, no image machine needed) ======================

// // Takes the first letter of the first two words in the name (e.g. "Adigun Tobiloba" -> "AT").
// // Falls back to the first two letters of a single word (e.g. "Seller" -> "SE").
// function getInitials(fullName: string): string {
//   const words = fullName.trim().split(/\s+/).filter(Boolean);
//   if (words.length === 0) return "?";
//   if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
//   return (words[0][0] + words[1][0]).toUpperCase();
// }

// // A small, pleasant, fixed palette so avatars stay legible and on-brand
// // (no random colors that could clash or land unreadable text-on-background).
// const AVATAR_PALETTE = [
//   { bg: "#E6EFFF", text: "#3B5BDB" }, // blue
//   { bg: "#E6F9F0", text: "#12866F" }, // teal
//   { bg: "#FFF0E6", text: "#C2410C" }, // orange
//   { bg: "#F3E8FF", text: "#7C3AED" }, // purple
//   { bg: "#FFE6EF", text: "#BE185D" }, // pink
//   { bg: "#EAF7E6", text: "#2F7D32" }, // green
// ];

// // Deterministic pick so the same seller always gets the same color across renders.
// function getAvatarColors(seed: string) {
//   let hash = 0;
//   for (let i = 0; i < seed.length; i++) {
//     hash = (hash << 5) - hash + seed.charCodeAt(i);
//     hash |= 0;
//   }
//   return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
// }

// const SellerAvatar = ({ seller }: { seller: Seller }) => {
//   if (seller.profileImage) {
//     return (
//       <Image
//         src={seller.profileImage}
//         alt={seller.fullName}
//         width={40}
//         height={40}
//         className="w-10 h-10 object-cover rounded-full shrink-0"
//       />
//     );
//   }

//   const { bg, text } = getAvatarColors(seller.id || seller.fullName);
//   return (
//     <div
//       className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
//       style={{ backgroundColor: bg, color: text }}
//       aria-label={seller.fullName}
//       title={seller.fullName}
//     >
//       {getInitials(seller.fullName)}
//     </div>
//   );
// };

// const OrdersSellersList = () => {
//   const router = useRouter();

//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchInput, setSearchInput] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [storeFilter, setStoreFilter] = useState<StoreFilter>("all");

//   // Debounce the search box so we don't hit the API on every keystroke.
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const handleSearchChange = useCallback((value: string) => {
//     setSearchInput(value);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       setSearchTerm(value.trim());
//       setCurrentPage(1); // reset to page 1 whenever the search changes
//     }, 350);
//   }, []);

//   const { data, isLoading, isFetching, error } = useGetAllSellerStoresQuery({
//     page: 1,
//     limit: 1000,
//   });

//   const apiData = data as ApiResponse | undefined;
//   const allSellers: Seller[] = apiData?.result?.data || [];

//   const filteredSellers = useMemo(() => {
//     let list = allSellers;

//     if (storeFilter !== "all") {
//       list = list.filter((s) =>
//         storeFilter === "hasStore" ? !!s.storeId : !s.storeId,
//       );
//     }

//     if (searchTerm) {
//       const q = searchTerm.toLowerCase();
//       list = list.filter((s) =>
//         [s.fullName, s.email, s.companyName, s.phoneNumber]
//           .join(" ")
//           .toLowerCase()
//           .includes(q),
//       );
//     }

//     return list;
//   }, [allSellers, storeFilter, searchTerm]);

//   const totalItems = filteredSellers.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

//   const sellers = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredSellers.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredSellers, currentPage]);

//   const handleViewDetails = (seller: Seller) => {
//     router.push(
//       `/dashboard/orders&payments/orderlogs/OrderLogs-Details?id=${seller.id}`,
//     );
//   };

//   const clearFilters = () => {
//     setSearchInput("");
//     setSearchTerm("");
//     setStoreFilter("all");
//     setCurrentPage(1);
//   };

//   const columns = [
//     {
//       header: "#",
//       accessor: "rowNumber",
//       className: "pl-4 pr-2",
//       render: (row: Seller) => {
//         const index = sellers.findIndex((s) => s.id === row.id);
//         const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
//         return (
//           <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#E6EFFF] bg-white text-sm font-semibold text-[#232321CC]">
//             {rowNumber}
//           </div>
//         );
//       },
//     },
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pr-12",
//       render: (row: Seller) => (
//         <div className="flex items-center gap-3">
//           <SellerAvatar seller={row} />
//           <div>
//             <p className="font-medium text-black">{row.fullName?.trim()}</p>
//             <p className="text-sm text-gray-500">{row.email}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: "Company Name",
//       accessor: "companyName",
//       className: "px-6",
//       render: (row: Seller) => (
//         <span className="text-black">
//           {row.companyName?.trim() || <span className="text-gray-400">—</span>}
//         </span>
//       ),
//     },
//     {
//       header: "Phone Number",
//       accessor: "phoneNumber",
//       className: "px-6",
//     },
//     {
//       header: "Store",
//       accessor: "storeId",
//       className: "px-6",
//       render: (row: Seller) =>
//         row.storeId ? (
//           <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-600 border border-green-200">
//             Active
//           </span>
//         ) : (
//           <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
//             No store
//           </span>
//         ),
//     },
//     {
//       header: "Total Products",
//       accessor: "totalProducts",
//       className: "px-6 text-center",
//     },
//     {
//       header: "Total Sales",
//       accessor: "totalSales",
//       className: "px-6 text-center",
//     },
//     {
//       header: "Total Revenue",
//       accessor: "totalRevenue",
//       className: "px-6 text-center",
//       render: (row: Seller) => (
//         <span className="font-medium">
//           $
//           {row.totalRevenue.toLocaleString(undefined, {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           })}
//         </span>
//       ),
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-6",
//       render: (row: Seller) => (
//         <button
//           onClick={() => handleViewDetails(row)}
//           className="rounded-lg bg-blue-500 px-2 py-1 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
//         >
//           View Details
//         </button>
//       ),
//     },
//   ];

//   if (error) {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Failed to load sellers. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header — title on the left, search & filters on the right */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-black font-sans">
//             Order Management
//           </h2>
//           <p className="text-sm  text-black/70 mt-1">
//             Browse all orders, monitor their status, review payment information,
//             and manage <br /> the order fulfillment process efficiently.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           <div className="relative">
//             <svg
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(e) => handleSearchChange(e.target.value)}
//               placeholder="Search name, email, company, phone"
//               className="border border-[#E6EFFF] rounded-lg pl-9 pr-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-200"
//             />
//           </div>

//           <select
//             value={storeFilter}
//             onChange={(e) => setStoreFilter(e.target.value as StoreFilter)}
//             className="border border-[#E6EFFF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//           >
//             <option value="all">All sellers</option>
//             <option value="hasStore">Has a store</option>
//             <option value="noStore">No store yet</option>
//           </select>

//           {(searchInput || storeFilter !== "all") && (
//             <button
//               onClick={clearFilters}
//               className="text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-2"
//             >
//               Clear
//             </button>
//           )}

//           {isFetching && !isLoading && (
//             <span className="text-xs text-gray-400">Updating…</span>
//           )}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mt-2">
//         <Table columns={columns} data={sellers} isLoading={isLoading} />
//       </div>

//       {/* Pagination — driven entirely by the API's meta (page/limit/total/totalPage) */}
//       {totalItems > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//           itemsPerPage={ITEMS_PER_PAGE}
//           totalItems={totalItems}
//         />
//       )}
//     </div>
//   );
// };

// export default OrdersSellersList;

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Table } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { useGetMyProductOrdersQuery } from "@/redux/features/product/productApi";
import { useGetMyProfileQuery } from "@/redux/features/auth/authApi";
// ⚠️ Adjust this import path to wherever useGetMyProfileQuery actually lives in your project

// ====================== PROFILE TYPES ======================

export interface MyProfile {
  id: string;
  fullName: string;
  location: string | null;
  Profile: unknown | null;
  profileImage: string | null;
  coverPhoto: string | null;
}

export interface MyProfileApiResponse {
  success: boolean;
  message: string;
  result: MyProfile;
}

// ====================== ORDER TYPES ======================

export interface OrderProduct {
  id: string;
  productName: string;
  productPhoto: string[];
}

export interface OrderVariant {
  id: string;
  sku: string;
  product: OrderProduct;
}

export interface OrderSeller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
}

export interface OrderBuyer {
  id: string;
  fullName: string;
  profileImage: string;
  email: string;
  phoneNumber: string;
  deliveryAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

export interface OrderPayment {
  id: string;
  amount: number;
  status: string; // e.g. "Paid"
  isPaid: boolean;
}

export interface OrderDeliveryDetails {
  phoneNumber: string;
  deliveryAddress: string;
  city: string;
  state: string;
  region: string;
  country: string | null;
  zipCode: string;
  fullDeliveryAddress: string;
}

export interface OrderInvoiceSummary {
  itemSubtotal: number;
  deliveryFee: number;
  processingFee: number;
  totalPayment: number;
}

export interface ProductOrder {
  id: string;
  paymentId: string;
  orderNumber: string;
  price: number;
  deliveryFee: number;
  quantity: number;
  currency: string;
  phoneNumber: string;
  zipCode: string;
  city: string;
  country: string | null;
  state: string;
  region: string;
  deliveryAddress: string;
  createdAt: string;
  orderStatus: string;
  isReviewed: boolean;
  payment: OrderPayment;
  variant: OrderVariant;
  store: { seller: OrderSeller };
  user: OrderBuyer;
  deliveryDetails: OrderDeliveryDetails;
  invoiceSummary: OrderInvoiceSummary;
}

export interface ProductOrdersApiResponse {
  success: boolean;
  message: string;
  result: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: ProductOrder[];
  };
}

export type SortByDate = "newest" | "oldest";

export interface GetMyProductOrdersParams {
  userId: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  orderStatus?: string;
  sortByDate?: SortByDate;
  /** ISO date string, e.g. new Date().toISOString() */
  fromDate?: string;
  /** ISO date string, e.g. new Date().toISOString() */
  toDate?: string;
}

const ITEMS_PER_PAGE = 25;

// Adjust this list to whatever your backend's real orderStatus enum is.
const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Accepted: "bg-blue-50 text-blue-600 border-blue-200",
  Processing: "bg-purple-50 text-purple-600 border-purple-200",
  Shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Delivered: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

// ====================== AVATAR FALLBACK (initials) ======================

function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: "#E6EFFF", text: "#3B5BDB" },
  { bg: "#E6F9F0", text: "#12866F" },
  { bg: "#FFF0E6", text: "#C2410C" },
  { bg: "#F3E8FF", text: "#7C3AED" },
  { bg: "#FFE6EF", text: "#BE185D" },
  { bg: "#EAF7E6", text: "#2F7D32" },
];

function getAvatarColors(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const PersonAvatar = ({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) => {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={40}
        height={40}
        className="w-10 h-10 object-cover rounded-full shrink-0"
      />
    );
  }
  const { bg, text } = getAvatarColors(name);
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
      style={{ backgroundColor: bg, color: text }}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

// ====================== HELPERS ======================

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Convert a plain <input type="date"> value into a start-of-day / end-of-day
// ISO string, matching the fromDate/toDate format seen in the Postman request.
function toStartOfDayISO(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}
function toEndOfDayISO(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.000Z`).toISOString();
}

// Defensively pull { data, meta } out of the API response regardless of
// small shape variations (result.data vs result.orders, etc). This is what
// stops a backend shape mismatch from silently rendering as "no data" with
// no error shown anywhere.
function extractOrdersPayload(apiData: unknown): {
  orders: ProductOrder[];
  meta: ProductOrdersApiResponse["result"]["meta"] | undefined;
} {
  if (!apiData || typeof apiData !== "object") {
    return { orders: [], meta: undefined };
  }
  const result = (apiData as Record<string, unknown>).result as
    | Record<string, unknown>
    | undefined;

  if (!result) return { orders: [], meta: undefined };

  const rawData = result.data ?? result.orders ?? result.items;
  const orders = Array.isArray(rawData) ? (rawData as ProductOrder[]) : [];

  const meta = result.meta as
    | ProductOrdersApiResponse["result"]["meta"]
    | undefined;

  return { orders, meta };
}

// ====================== COMPONENT ======================
// No props needed — userId is resolved internally via useGetMyProfileQuery.

const OrdersList = () => {
  const router = useRouter();

  // 1) Resolve the logged-in user's id from their profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetMyProfileQuery("");

  const profile = profileData as MyProfileApiResponse | undefined;
  const userId = profile?.result?.id;

  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [orderStatus, setOrderStatus] = useState("");
  const [sortByDate, setSortByDate] = useState<SortByDate>("newest");

  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");

  // Debounce search so we don't hit the API on every keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setCurrentPage(1);
    }, 350);
  }, []);

  const fromDate = fromDateInput ? toStartOfDayISO(fromDateInput) : undefined;
  const toDate = toDateInput ? toEndOfDayISO(toDateInput) : undefined;

  // 2) Only fire this once we actually have a userId from the profile call.
  // NOTE: this hits GET /payment/my-store-orders/:userId?page&limit&orderStatus&sortByDate&fromDate&toDate
  // userId MUST be sent as a path segment by the RTK Query endpoint definition,
  // not as a query param — that mismatch is the most likely cause of "blank data".
  const { data, isLoading, isFetching, error } = useGetMyProductOrdersQuery(
    {
      userId: userId as string,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      searchTerm: searchTerm || undefined,
      orderStatus: orderStatus || undefined,
      sortByDate,
      fromDate,
      toDate,
    },
    { skip: !userId },
  );

  const { orders, meta } = extractOrdersPayload(data);

  const totalItems = meta?.total ?? 0;
  const totalPages = Math.max(1, meta?.totalPage ?? 1);

  // 3) If currentPage drifts past the real range returned by the API (e.g. a
  // filter shrank the result set while we were sitting on a later page),
  // snap back to the last valid page instead of showing an empty table with
  // no explanation. Guarded so it only fires once meta has actually loaded.
  useEffect(() => {
    if (meta && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [meta, totalPages, currentPage]);

  const handleViewDetails = (order: ProductOrder) => {
    router.push(
      `/dashboard/orders&payments/orderlogs/OrderLogs-Details?id=${order.id}`,
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setOrderStatus("");
    setSortByDate("newest");
    setFromDateInput("");
    setToDateInput("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchInput ||
    orderStatus ||
    fromDateInput ||
    toDateInput ||
    sortByDate !== "newest";

  const columns = [
    {
      header: "#",
      accessor: "rowNumber",
      className: "pl-4 pr-2",
      render: (row: ProductOrder) => {
        const index = orders.findIndex((o) => o.id === row.id);
        const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#E6EFFF] bg-white text-sm font-semibold text-[#232321CC]">
            {rowNumber}
          </div>
        );
      },
    },
    {
      header: "Order",
      accessor: "order",
      className: "pr-6",
      render: (row: ProductOrder) => (
        <div className="flex items-center gap-3">
          {row.variant?.product?.productPhoto?.[0] ? (
            <Image
              src={row.variant.product.productPhoto[0]}
              alt={row.variant.product.productName}
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-lg border border-[#E6EFFF] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-black">{row.orderNumber}</p>
            <p className="text-sm text-gray-500 truncate max-w-[220px]">
              {row.variant?.product?.productName}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "customer",
      className: "px-6",
      render: (row: ProductOrder) => (
        <div className="flex items-center gap-3">
          <PersonAvatar
            name={row.user?.fullName ?? "Unknown"}
            image={row.user?.profileImage}
          />
          <div className="min-w-0">
            <p className="font-medium text-black truncate max-w-[180px]">
              {row.user?.fullName?.trim()}
            </p>
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
              {row.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phoneNumber",
      className: "px-6",
      render: (row: ProductOrder) => (
        <span className="text-black">
          {row.deliveryDetails?.phoneNumber ?? row.phoneNumber}
        </span>
      ),
    },
    {
      header: "Qty",
      accessor: "quantity",
      className: "px-6 text-center",
    },
    {
      header: "Total",
      accessor: "total",
      className: "px-6 text-center",
      render: (row: ProductOrder) => (
        <span className="font-medium text-black">
          {formatMoney(
            row.invoiceSummary?.totalPayment ?? row.price,
            row.currency,
          )}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: "paymentStatus",
      className: "px-6",
      render: (row: ProductOrder) =>
        row.payment?.isPaid ? (
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-600 border border-green-200">
            Paid
          </span>
        ) : (
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
            {row.payment?.status || "Unpaid"}
          </span>
        ),
    },
    {
      header: "Status",
      accessor: "orderStatus",
      className: "px-6",
      render: (row: ProductOrder) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${
            STATUS_STYLES[row.orderStatus] ||
            "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {row.orderStatus}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      className: "px-6",
      render: (row: ProductOrder) => (
        <span className="text-black">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Details",
      accessor: "details",
      className: "px-6",
      render: (row: ProductOrder) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="rounded-lg bg-blue-500 px-2 py-1 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
      ),
    },
  ];

  // ---- Guard states ----

  if (isProfileLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading your account…</div>
    );
  }

  if (isProfileError || !userId) {
    return (
      <div className="p-8 text-center text-red-600">
        Couldn&apos;t load your profile. Please try logging in again.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Failed to load orders. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-sans">
            Order Management
          </h2>
          <p className="text-sm text-black/70 mt-1">
            Browse all orders, monitor their status, review payment information,
            and manage <br /> the order fulfillment process efficiently.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search order #, product, customer"
              className="border border-[#E6EFFF] rounded-lg pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Order status */}
          <select
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-[#E6EFFF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort by date */}
          <select
            value={sortByDate}
            onChange={(e) => {
              setSortByDate(e.target.value as SortByDate);
              setCurrentPage(1);
            }}
            className="border border-[#E6EFFF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          {/* Date range */}
          <div className="flex items-center gap-1 border border-[#E6EFFF] rounded-lg px-2 py-1">
            <input
              type="date"
              value={fromDateInput}
              onChange={(e) => {
                setFromDateInput(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm px-1 py-1 focus:outline-none"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="date"
              value={toDateInput}
              onChange={(e) => {
                setToDateInput(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm px-1 py-1 focus:outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-2"
            >
              Clear
            </button>
          )}

          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400">Updating…</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-2">
        <Table columns={columns} data={orders} isLoading={isLoading} />
      </div>

      {/* Pagination — driven by the API's own meta (page/limit/total/totalPage) */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default OrdersList;
