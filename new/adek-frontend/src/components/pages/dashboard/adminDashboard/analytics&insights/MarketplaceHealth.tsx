// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   Cell,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/Card/Card";
// import { Button } from "@/components/ui/Button/Button";
// import { Badge } from "@/components/ui/Badge/badge";
// import { Table } from "@/components/ui/Table/Table";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/Select/select";
// import {
//   useGetMarketPlaceHealthDataQuery,
//   useGetMarketPlaceRevenueChartQuery,
//   useGetMarketPlaceSalesChartQuery,
//   useGetNewListedProductsQuery,
// } from "@/redux/features/dashborad/MarketPlace/marketPlaceApi";

// export type ProductListData = {
//   id: string;
//   productName: string;
//   createdAt: string;
//   totalOrder: number;
//   sellerInfo: {
//     id: string;
//     fullName: string;
//     profileImage: string;
//     location: string | null;
//   };
//   store: {
//     id: string;
//     storeName: string;
//     bannerImage: string;
//   };
// };

// export default function MarketplaceHealth() {
//   const router = useRouter();
//   const [selectedSort, setSelectedSort] = useState("year");
//   const [activeInsight, setActiveInsight] = useState("12 months");

//   const {
//     data: newListedProducts,
//     isLoading: isLoadingNewListings,
//     isError: isErrorNewListings,
//   } = useGetNewListedProductsQuery({});

//   const {
//     data: marketPlaceHealthData,
//     isLoading: isLoadingHealth,
//     isError: isErrorHealth,
//   } = useGetMarketPlaceHealthDataQuery({});

//   const {
//     data: marketPlaceRevenueChartData,
//     isLoading: isLoadingRevenue,
//     isError: isErrorRevenue,
//   } = useGetMarketPlaceRevenueChartQuery({ filter: selectedSort });

//   const { data: marketPlaceSalesChartData } = useGetMarketPlaceSalesChartQuery({
//     filter: activeInsight,
//   });

//   const newListedProductsData = newListedProducts?.result?.productData ?? [];
//   const marketPlaceHealth = marketPlaceHealthData?.result ?? {};
//   const barChartData = marketPlaceRevenueChartData?.result ?? [];
//   const lineChartData = marketPlaceSalesChartData?.result ?? [];

//   const columns = [
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",
//       render: (row: ProductListData) => {
//         const sellerImageUrl =
//           row?.sellerInfo?.profileImage || "/placeholder.svg";
//         const sellerName = row?.sellerInfo?.fullName || "Unknown";
//         return (
//           <div className="flex items-center">
//             <Image
//               src={sellerImageUrl}
//               alt={sellerName}
//               width={40}
//               height={40}
//               className="w-10 h-10 object-cover object-center rounded-full mr-4"
//             />
//             <span>{sellerName}</span>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Location",
//       accessor: "location",
//       className: "px-12",
//       render: (row: ProductListData) => (
//         <span>{row?.sellerInfo?.location ?? "Unknown"}</span>
//       ),
//     },
//     {
//       header: "Product name",
//       accessor: "productName",
//       className: "px-12",
//     },
//     {
//       header: "Date",
//       accessor: "createdAt",
//       className: "px-12",
//       render: (row: ProductListData) => (
//         <span>
//           {row?.createdAt
//             ? new Date(row.createdAt).toLocaleDateString()
//             : "Unknown"}
//         </span>
//       ),
//     },
//     {
//       header: "Total Order",
//       accessor: "totalOrder",
//       className: "px-12",
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-2",
//       render: (row: ProductListData) => (
//         <div className="flex items-center space-x-2">
//           <button
//             className="rounded-[8px] bg-black/20 hover:bg-black/10 inline-block px-2 py-1 text-black font-inter text-base"
//             onClick={() => handleViewDetails(row)}
//           >
//             View
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const handleViewDetails = (row: ProductListData) => {
//     const sellerId = row?.sellerInfo?.id;
//     const storeId = row?.store?.id; // ← Fixed: now comes from real API data
//     if (!sellerId || !storeId) return;

//     // Fixed route (kept your exact path format)
//     router.push(
//       `/dashboard/analytics&insights/marketplace-health/Marketplace-Health-Details?sellerId=${sellerId}&storeId=${storeId}`,
//     );
//   };

//   return (
//     <div className="min-h-screen bg-[#F6F6F6] p-6">
//       <div className="space-y-6">
//         {/* Top Metrics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {/* Card 1 - Total sales */}
//           <Card className="bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-gray-600">Total sales</span>
//                 <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
//                   {/* SVG icon kept unchanged */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="25"
//                     height="25"
//                     viewBox="0 0 25 25"
//                     fill="none"
//                   >
//                     <path
//                       d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
//                       fill="#007BFF"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               {isLoadingHealth ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : isErrorHealth ? (
//                 <div className="text-2xl font-bold text-gray-900">0</div>
//               ) : (
//                 <div className="text-2xl font-bold text-gray-900">
//                   {marketPlaceHealth?.totalSales ?? 0}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Card 2 - Number of order */}
//           <Card className="bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-gray-600">Number of order</span>
//                 <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
//                   {/* SVG icon kept unchanged */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="25"
//                     height="25"
//                     viewBox="0 0 25 25"
//                     fill="none"
//                   >
//                     <path
//                       d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
//                       fill="#007BFF"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               {isLoadingHealth ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : isErrorHealth ? (
//                 <div className="text-2xl font-bold text-gray-900">0</div>
//               ) : (
//                 <div className="text-2xl font-bold text-gray-900">
//                   {marketPlaceHealth?.totalOrders ?? 0}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Card 3 - Number of product */}
//           <Card className="bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-gray-600">Number of product</span>
//                 <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
//                   {/* SVG icon kept unchanged */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="25"
//                     height="25"
//                     viewBox="0 0 25 25"
//                     fill="none"
//                   >
//                     <path
//                       d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
//                       fill="#007BFF"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               {isLoadingHealth ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : isErrorHealth ? (
//                 <div className="text-2xl font-bold text-gray-900">0</div>
//               ) : (
//                 <div className="text-2xl font-bold text-gray-900">
//                   {marketPlaceHealth?.totalProduct ?? 0}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Card 4 - Platform revenue */}
//           <Card className="bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-gray-600">Platform revenue</span>
//                 <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
//                   {/* SVG icon kept unchanged */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="25"
//                     height="25"
//                     viewBox="0 0 25 25"
//                     fill="none"
//                   >
//                     <path
//                       d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
//                       fill="#007BFF"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               {isLoadingHealth ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : isErrorHealth ? (
//                 <div className="text-2xl font-bold text-gray-900">0</div>
//               ) : (
//                 <div className="text-2xl font-bold text-gray-900">
//                   {marketPlaceHealth?.totalRevenue?._sum?.amount ?? 0}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Revenue Chart */}
//         <Card className="bg-white">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle className="text-lg font-semibold">
//               Total platform revenue status
//             </CardTitle>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600 text-nowrap">
//                 Sort By:
//               </span>
//               <Select value={selectedSort} onValueChange={setSelectedSort}>
//                 <SelectTrigger className="w-24">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="year">Yearly</SelectItem>
//                   <SelectItem value="month">Monthly</SelectItem>
//                   <SelectItem value="week">Weekly</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart width={600} height={300} data={barChartData}>
//                   <XAxis dataKey="period" axisLine={false} tickLine={false} />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     domain={[
//                       0,
//                       Math.max(...barChartData.map((d: any) => d.revenue || 0)),
//                     ]}
//                     tickFormatter={(value) => `$${value}`}
//                   />
//                   {isLoadingRevenue ? (
//                     <Skeleton className="h-full w-full" />
//                   ) : isErrorRevenue ? (
//                     <p className="flex h-full items-center justify-center text-gray-400">
//                       Data Not Found
//                     </p>
//                   ) : (
//                     <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
//                       {barChartData.map((entry: any, index: number) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={entry.revenue > 0 ? "#3B82F6" : "#D1D5DB"}
//                         />
//                       ))}
//                     </Bar>
//                   )}
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Sales Insights */}
//         <Card className="bg-white">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">
//               Sales insights
//             </CardTitle>
//             <div className="flex flex-wrap items-center gap-2 mt-4">
//               {["12months", "30days", "7days", "24hours"].map((period) => (
//                 <Button
//                   key={period}
//                   variant={activeInsight === period ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setActiveInsight(period)}
//                   className={
//                     activeInsight === period
//                       ? "bg-blue-600 hover:bg-blue-700"
//                       : ""
//                   }
//                 >
//                   {period}
//                 </Button>
//               ))}
//               <div className="ml-auto flex gap-2">
//                 <Badge
//                   variant="outline"
//                   className="text-blue-600 border-blue-200"
//                 >
//                   Listing
//                 </Badge>
//                 <Badge
//                   variant="outline"
//                   className="text-blue-600 border-blue-200"
//                 >
//                   Order
//                 </Badge>
//                 <Badge
//                   variant="outline"
//                   className="text-blue-600 border-blue-200"
//                 >
//                   Delivered
//                 </Badge>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={lineChartData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     domain={[0, 50]}
//                     ticks={[0, 10, 20, 30, 40, 50]}
//                   />
//                   <Line
//                     type="basis"
//                     dataKey="listing"
//                     stroke="#EC4899"
//                     strokeWidth={3}
//                     dot={false}
//                     strokeLinecap="round"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="order"
//                     stroke="#3B82F6"
//                     strokeWidth={3}
//                     dot={false}
//                     strokeLinecap="round"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="delivered"
//                     stroke="#8B5CF6"
//                     strokeWidth={3}
//                     dot={false}
//                     strokeLinecap="round"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="listing"
//                     stroke="#06B6D4"
//                     strokeWidth={2}
//                     strokeDasharray="5 5"
//                     dot={false}
//                     strokeLinecap="round"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* New Listings Table */}
//         <Card className="bg-white">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle className="text-lg font-semibold">
//                 New listings ({newListedProducts?.result?.newListedProduct ?? 0}
//                 )
//               </CardTitle>
//               <p className="text-sm text-gray-600 mt-1">
//                 All new product listing
//               </p>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {isLoadingNewListings ? (
//               <Skeleton className="h-96 w-full" />
//             ) : isErrorNewListings ? (
//               <p className="py-8 text-center text-gray-400">
//                 Not Found New Listings Products
//               </p>
//             ) : (
//               <Table columns={columns} data={newListedProductsData} />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/badge";
import { Table } from "@/components/ui/Table/Table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/select";
import {
  useGetMarketPlaceHealthDataQuery,
  useGetMarketPlaceRevenueChartQuery,
  useGetMarketPlaceSalesChartQuery,
  useGetNewListedProductsQuery,
} from "@/redux/features/dashborad/MarketPlace/marketPlaceApi";

export type ProductListData = {
  id: string;
  productName: string;
  createdAt: string;
  totalOrder: number;
  sellerInfo: {
    id: string;
    fullName: string;
    profileImage: string;
    location: string | null;
  };
  store: {
    id: string;
    storeName: string;
    bannerImage: string;
  };
  __rowNumber?: number;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Truncates a product name to a max number of words, adding "..." if cut.
// The full name is still available via the `title` attribute for a native
// hover tooltip, so nothing is actually lost.
function truncateProductName(name: string, maxWords: number = 7) {
  if (!name) return "Unknown";
  const words = name.trim().split(/\s+/);
  if (words.length <= maxWords) return name;
  return words.slice(0, maxWords).join(" ") + "...";
}

/* ------------------------------------------------------------------ */
/* Chart tooltips                                                      */
/* ------------------------------------------------------------------ */

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value ?? 0;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm text-blue-600">
          Revenue:{" "}
          <span className="font-semibold">
            ${Number(value).toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const SalesTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // The chart plots "listing" twice (solid + dashed), so de-dupe by dataKey
    // before rendering the tooltip rows.
    const seen = new Set<string>();
    const rows = payload.filter((entry: any) => {
      if (seen.has(entry.dataKey)) return false;
      seen.add(entry.dataKey);
      return true;
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 space-y-1 min-w-[140px]">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        {rows.map((entry: any) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-1.5 capitalize text-gray-600">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.dataKey}
            </span>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ------------------------------------------------------------------ */
/* New Listings table (self-contained: table + pagination)             */
/* ------------------------------------------------------------------ */

function NewListingsTable({
  data,
  columns,
  isLoading,
  isError,
}: {
  data: ProductListData[];
  columns: any[];
  isLoading: boolean;
  isError: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // If the underlying data shrinks (e.g. a refetch) and the current page no
  // longer exists, snap back to the last valid page.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    // Attach a page-aware serial number (1, 2, 3…) to each row so the "No."
    // column keeps counting across pages instead of restarting at 1.
    return data.slice(start, start + itemsPerPage).map((row, idx) => ({
      ...row,
      __rowNumber: start + idx + 1,
    }));
  }, [data, currentPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Builds a compact page-number list (with ellipses) instead of rendering
  // every single page button when there are many pages.
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

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-gray-400">
        Not Found New Listings Products
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-[8px]">
        <div className="min-w-[720px]">
          <Table columns={columns} data={paginatedData} />
        </div>
      </div>

      {totalItems > 0 && (
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

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function MarketplaceHealth() {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("year");
  const [activeInsight, setActiveInsight] = useState("12 months");

  const {
    data: newListedProducts,
    isLoading: isLoadingNewListings,
    isError: isErrorNewListings,
  } = useGetNewListedProductsQuery({});

  const {
    data: marketPlaceHealthData,
    isLoading: isLoadingHealth,
    isError: isErrorHealth,
  } = useGetMarketPlaceHealthDataQuery({});

  const {
    data: marketPlaceRevenueChartData,
    isLoading: isLoadingRevenue,
    isError: isErrorRevenue,
  } = useGetMarketPlaceRevenueChartQuery({ filter: selectedSort });

  const { data: marketPlaceSalesChartData } = useGetMarketPlaceSalesChartQuery({
    filter: activeInsight,
  });

  const newListedProductsData = newListedProducts?.result?.productData ?? [];
  const marketPlaceHealth = marketPlaceHealthData?.result ?? {};
  const barChartData = marketPlaceRevenueChartData?.result ?? [];
  const lineChartData = marketPlaceSalesChartData?.result ?? [];

  const columns = [
    {
      header: "No.",
      accessor: "no",
      className: "pl-4 pr-2 w-12",
      render: (row: ProductListData) => (
        <span className="text-gray-500">{row?.__rowNumber ?? "-"}</span>
      ),
    },
    {
      header: "Sellers Name",
      accessor: "sellersName",
      className: "pr-12",
      render: (row: ProductListData) => {
        // Fallback chain: seller's own profile photo → store banner image →
        // a colored circle with the seller's first initial, so there's
        // always something recognizable even when no photo was uploaded.
        const sellerName = row?.sellerInfo?.fullName || "Unknown";
        const avatarUrl =
          row?.sellerInfo?.profileImage || row?.store?.bannerImage || "";
        const initial = sellerName.trim().charAt(0).toUpperCase() || "?";

        return (
          <div className="flex items-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={sellerName}
                width={40}
                height={40}
                className="w-10 h-10 object-cover object-center rounded-full mr-4 shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full mr-4 shrink-0 flex items-center justify-center bg-blue-100 text-blue-700 font-semibold text-sm"
                title={sellerName}
              >
                {initial}
              </div>
            )}
            <span className="truncate max-w-[140px]" title={sellerName}>
              {sellerName}
            </span>
          </div>
        );
      },
    },
    {
      header: "Location",
      accessor: "location",
      className: "px-12",
      render: (row: ProductListData) => (
        <span>{row?.sellerInfo?.location ?? "Unknown"}</span>
      ),
    },
    {
      header: "Product name",
      accessor: "productName",
      className: "px-12",
      render: (row: ProductListData) => {
        const fullName = row?.productName ?? "Unknown";
        return (
          <span
            className="inline-block max-w-[220px] truncate align-middle"
            title={fullName}
          >
            {truncateProductName(fullName, 7)}
          </span>
        );
      },
    },
    {
      header: "Date",
      accessor: "createdAt",
      className: "px-12",
      render: (row: ProductListData) => (
        <span>
          {row?.createdAt
            ? new Date(row.createdAt).toLocaleDateString()
            : "Unknown"}
        </span>
      ),
    },
    {
      header: "Total Order",
      accessor: "totalOrder",
      className: "px-12",
    },
    {
      header: "Details",
      accessor: "details",
      className: "px-2",
      render: (row: ProductListData) => (
        <div className="flex items-center space-x-2">
          <button
            className="rounded-[8px] bg-black/20 hover:bg-black/10 inline-block px-2 py-1 text-black font-inter text-base"
            onClick={() => handleViewDetails(row)}
          >
            View
          </button>
        </div>
      ),
    },
  ];

  const handleViewDetails = (row: ProductListData) => {
    const sellerId = row?.sellerInfo?.id;
    const storeId = row?.store?.id; // ← comes from real API data
    if (!sellerId || !storeId) return;

    router.push(
      `/dashboard/analytics&insights/marketplace-health/Marketplace-Health-Details?sellerId=${sellerId}&storeId=${storeId}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6">
      <div className="space-y-6">
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 - Total sales */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total sales</span>
                <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
                      fill="#007BFF"
                    />
                  </svg>
                </div>
              </div>
              {isLoadingHealth ? (
                <Skeleton className="h-8 w-24" />
              ) : isErrorHealth ? (
                <div className="text-2xl font-bold text-gray-900">0</div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {marketPlaceHealth?.totalSales ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2 - Number of order */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Number of order</span>
                <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
                      fill="#007BFF"
                    />
                  </svg>
                </div>
              </div>
              {isLoadingHealth ? (
                <Skeleton className="h-8 w-24" />
              ) : isErrorHealth ? (
                <div className="text-2xl font-bold text-gray-900">0</div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {marketPlaceHealth?.totalOrders ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3 - Number of product */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Number of product</span>
                <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
                      fill="#007BFF"
                    />
                  </svg>
                </div>
              </div>
              {isLoadingHealth ? (
                <Skeleton className="h-8 w-24" />
              ) : isErrorHealth ? (
                <div className="text-2xl font-bold text-gray-900">0</div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {marketPlaceHealth?.totalProduct ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4 - Platform revenue */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Platform revenue</span>
                <div className="w-[43.765px] h-[43.765px] rounded-full flex items-center justify-center bg-[rgba(0,187,229,0.08)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M12.0203 0C5.39152 0 0 5.39152 0 12.0203C0 18.6491 5.39152 24.0407 12.0203 24.0407C18.6491 24.0407 24.0407 18.6491 24.0407 12.0203C24.0407 5.39152 18.6491 0 12.0203 0ZM12.0203 10.8215C14.0077 10.8215 15.6296 12.437 15.6296 14.4308C15.6296 15.9951 14.6231 17.3157 13.2256 17.8157V19.2389H10.8215V17.8157C9.42394 17.3157 8.41744 15.9951 8.41744 14.4308H10.8215C10.8215 15.0911 11.36 15.6361 12.0267 15.6361C12.6935 15.6361 13.232 15.0975 13.232 14.4308C13.232 13.7641 12.6935 13.2256 12.0267 13.2256C10.0394 13.2256 8.41744 11.61 8.41744 9.61627C8.41744 8.05202 9.42394 6.73139 10.8215 6.23134V4.80813H13.2256V6.23134C14.6231 6.73139 15.6296 8.05202 15.6296 9.61627H13.2256C13.2256 8.95595 12.6871 8.41103 12.0203 8.41103C11.3536 8.41103 10.8151 8.94954 10.8151 9.61627C10.8151 10.283 11.36 10.8215 12.0203 10.8215Z"
                      fill="#007BFF"
                    />
                  </svg>
                </div>
              </div>
              {isLoadingHealth ? (
                <Skeleton className="h-8 w-24" />
              ) : isErrorHealth ? (
                <div className="text-2xl font-bold text-gray-900">0</div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {marketPlaceHealth?.totalRevenue?._sum?.amount ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Total platform revenue status
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 text-nowrap">
                Sort By:
              </span>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Yearly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingRevenue ? (
                <Skeleton className="h-full w-full" />
              ) : isErrorRevenue ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Data Not Found
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="period" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      domain={[
                        0,
                        Math.max(
                          ...barChartData.map((d: any) => d.revenue || 0),
                          1,
                        ),
                      ]}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={<RevenueTooltip />}
                      cursor={{ fill: "rgba(59,130,246,0.08)" }}
                    />
                    <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                      {barChartData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.revenue > 0 ? "#3B82F6" : "#D1D5DB"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales Insights */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Sales insights
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {["12months", "30days", "7days", "24hours"].map((period) => (
                <Button
                  key={period}
                  variant={activeInsight === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveInsight(period)}
                  className={
                    activeInsight === period
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {period}
                </Button>
              ))}
              <div className="ml-auto flex gap-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Listing
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Order
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Delivered
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 50]}
                    ticks={[0, 10, 20, 30, 40, 50]}
                  />
                  <Tooltip
                    content={<SalesTooltip />}
                    cursor={{ stroke: "#D1D5DB", strokeWidth: 1 }}
                  />
                  <Line
                    type="basis"
                    dataKey="listing"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                  />
                  <Line
                    type="monotone"
                    dataKey="order"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                  />
                  <Line
                    type="monotone"
                    dataKey="listing"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    strokeLinecap="round"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Listings Table (table + pagination bundled together) */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                New listings ({newListedProducts?.result?.newListedProduct ?? 0}
                )
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                All new product listing
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <NewListingsTable
              data={newListedProductsData}
              columns={columns}
              isLoading={isLoadingNewListings}
              isError={isErrorNewListings}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
